const nav = document.querySelector('nav');
const hamburger = document.querySelector('.hamburger-toggle');
const navLinks = document.querySelectorAll('nav ul li');
const indicator = document.querySelector('.indicator');
const homeLink = document.querySelector('nav a:first-child');

let userClicked = false; // Flag to stop scroll-spy after a user click
let scrollTimeout; // Helper for the timeout

// --- 🚀 STANDALONE PAGE LOGIC (CORRECTED & ROBUST) ---
// Define a mapping of standalone page directories to their nav selectors.
const standalonePageMapping = {
    // Keys match the directory/ (e.g., 'design/' for /design/index.html)
    // Selectors point to the anchor tags within the nav list items.
    'design/': 'nav ul li a[href*="#design"]',
    'videomaking/': 'nav ul li a[href*="#videomaking"]',
    'coding/': 'nav ul li a[href*="#coding"]'
};

const currentPageURL = window.location.href; 
let isStandalonePage = false;
let activeStandaloneLink = null; // Stores the selector string

for (const [directory, selector] of Object.entries(standalonePageMapping)) {
    // Robust check for URLs like .../directory/ or .../directory/index.html
    const directoryPattern = new RegExp(`\/${directory}(index.html)?$`);
    
    if (directoryPattern.test(currentPageURL)) {
        isStandalonePage = true;
        activeStandaloneLink = selector; 
        break;
    }
}
// --- END STANDALONE PAGE LOGIC ---


// Function to update the indicator's position (No changes here)
function updateIndicatorPosition(activeElement) {
    if (!activeElement || window.innerWidth < 1024) { 
        indicator.style.display = 'none';
        return;
    }
    indicator.style.display = 'block';
    const navRect = nav.getBoundingClientRect();
    const elementRect = activeElement.getBoundingClientRect();
    const newLeft = elementRect.left - navRect.left - 50;
    const newTop = 10;
    let newHeight;
    let newWidth = elementRect.width;
    const firstLi = document.querySelector('nav ul li'); 
    if (activeElement === homeLink && firstLi) {
        newHeight = firstLi.getBoundingClientRect().height;
        newWidth = elementRect.width*0.5;
    } else {
        newHeight = elementRect.height;
        newWidth = elementRect.width + 100;
    }
    indicator.style.left = `${newLeft}px`;
    indicator.style.width = `${newWidth}px`;
    indicator.style.height = `${newHeight}px`; 
    indicator.style.top = `${newTop + 5}px`; 
    indicator.style.transition = 'left 0.3s ease-out, width 0.3s ease-out, top 0.3s ease-out';
}

// --- 🚀 CORRECTED INITIALIZATION LOGIC (Fixes Requests 1, 2, and Flashing) ---
if (isStandalonePage && activeStandaloneLink) {
    // Logic for Standalone Pages (e.g., /coding/)
    window.onload = function() {
        // Query the link element using the stored selector
        const linkElement = document.querySelector(activeStandaloneLink);
        const liToActivate = linkElement ? linkElement.parentNode : null;
        
        if (liToActivate) {
            navLinks.forEach(i => i.classList.remove('active'));
            homeLink.classList.remove('active');
            liToActivate.classList.add('active'); // Activate the correct li
        }

        // 2. Cursor Fix: Initialize cursor position to current mouse position
        circle.x = mouse.x;
        circle.y = mouse.y;

        // 3. Indicator Fix: Use a small timeout to wait for browser rendering
        setTimeout(() => {
            // Position the indicator on the found link, or home link if not found
            updateIndicatorPosition(liToActivate || homeLink);
        }, 50); 
    };
} else {
    // Default (index.html or not found) behavior
    homeLink.classList.add('active'); 
    window.onload = function() {
        window.scrollTo(0, 0);
        
        // 2. Cursor Fix: Initialize cursor position to current mouse position
        circle.x = mouse.x;
        circle.y = mouse.y;

        // 3. Indicator Fix: Use a small timeout
        setTimeout(() => {
            updateIndicatorPosition(homeLink);
        }, 50);
    };
}
// --- END CORRECTED INITIALIZATION LOGIC ---

// Click handler for navigation links (li elements)
navLinks.forEach(item => {
    item.addEventListener('click', (e) => {
        userClicked = true; // Set flag to disable scroll-spy
        
        navLinks.forEach(i => i.classList.remove('active'));
        homeLink.classList.remove('active'); 
        item.classList.add('active');
        updateIndicatorPosition(item); 
        
        setTimeout(() => {
            nav.classList.remove('menu-open');
            hamburger.setAttribute('aria-expanded', false);
        }, 100); 

        // Reset the flag after the smooth scroll is likely finished
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => { userClicked = false; }, 1000); // 1 second delay
    });
});

// Click handler for the logo/main link
homeLink.addEventListener('click', (e) => {
    userClicked = true; // Set flag to disable scroll-spy
    
    navLinks.forEach(i => i.classList.remove('active'));
    homeLink.classList.add('active');
    updateIndicatorPosition(homeLink);
    
    setTimeout(() => {
        nav.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', false);
    }, 100);

    // Reset the flag after the smooth scroll is likely finished
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => { userClicked = false; }, 1000); // 1 second delay
});
hamburger.addEventListener('click', () => {
    nav.classList.toggle('menu-open');
    const isExpanded = nav.classList.contains('menu-open');
    hamburger.setAttribute('aria-expanded', isExpanded);
});

window.addEventListener('resize', () => {
    const currentActive = document.querySelector('nav ul li.active') || document.querySelector('nav a.active');
    updateIndicatorPosition(currentActive);
});

// --- SCROLL-SPY LOGIC ---
const sections = document.querySelectorAll('.main > div, #landing');
const observerOptions = {
    root: null, 
    rootMargin: '-50% 0px -50% 0px', // Activates section when it hits the middle of the viewport
    threshold: 0
};

function observerCallback(entries) {
    // Ignore scroll-spy if the user clicked (smooth scroll is ongoing) or is on a standalone page
    if (userClicked || isStandalonePage) return; 
    
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            let elementToActivate;
            
            if (id === 'landing') {
                elementToActivate = homeLink;
            } else {
                const matchingLink = document.querySelector(`nav ul li a[href="#${id}"]`);
                if (matchingLink) {
                    elementToActivate = matchingLink.parentNode;
                }
            }
            if (elementToActivate) {
                navLinks.forEach(i => i.classList.remove('active'));
                homeLink.classList.remove('active');
                elementToActivate.classList.add('active');
                updateIndicatorPosition(elementToActivate);
            }
        }
    });
}

const observer = new IntersectionObserver(observerCallback, observerOptions);

// Only observe sections if not on a standalone page
if (!isStandalonePage) {
    sections.forEach(sec => observer.observe(sec));
}


console.clear();

// Select the circle element
const circleElement = document.querySelector('.circle');
const scircleElement = document.querySelector('.small-circle');

// --- Cursor Hover/Click States ---
document.addEventListener('mousedown', () => {
    scircleElement.classList.add('clicked');
});

document.addEventListener('mouseup', () => {
    scircleElement.classList.remove('clicked');
});

const interactiveElements = document.querySelectorAll('a, button, .web-button');

function addHoverClass() {
    scircleElement.classList.add('hovering');
}

function removeHoverClass() {
    scircleElement.classList.remove('hovering');
}

interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', addHoverClass);
    element.addEventListener('mouseleave', removeHoverClass);
});
// --- End Cursor States ---

// --- Custom Cursor Animation Variables ---
const mouse = { x: 0, y: 0 }; // Track current mouse position
const previousMouse = { x: 0, y: 0 } // Store the previous mouse position
const circle = { x: 0, y: 0 }; // Track the circle position (initialized in window.onload)

let currentScale = 0; // Track current scale value
let currentAngle = 0; // Track current angle value

// Update mouse position on the 'mousemove' event
window.addEventListener('mousemove', (e) => {
mouse.x = e.x;
mouse.y = e.y;
});

// Smoothing factor for cursor movement speed
const speed = 0.5;

// Start animation loop
const tick = () => {
// MOVE
// Calculate circle movement based on mouse position and smoothing
circle.x += (mouse.x - circle.x) * speed;
circle.y += (mouse.y - circle.y) * speed;
// Create a transformation string for cursor translation
const translateTransform = `translate(${circle.x}px, ${circle.y}px)`;

// SQUEEZE (Stretch/Squash effect based on velocity)
const deltaMouseX = mouse.x - previousMouse.x;
const deltaMouseY = mouse.y - previousMouse.y;
previousMouse.x = mouse.x;
previousMouse.y = mouse.y;
const mouseVelocity = Math.min(Math.sqrt(deltaMouseX**2 + deltaMouseY**2) * 4, 150); 
const scaleValue = (mouseVelocity / 150) * 0.5;
currentScale += (scaleValue - currentScale) * speed;
let scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

// ROTATE (Rotate to follow the direction of movement)
const angle = Math.atan2(deltaMouseY, deltaMouseX) * 180 / Math.PI;
if (mouseVelocity > 20) {
    currentAngle = angle;
}
const rotateTransform = `rotate(${currentAngle}deg)`;

// Apply all transformations
circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;
scircleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;

// Request the next frame to continue the animation
window.requestAnimationFrame(tick);
}

// Start the animation loop
tick();
