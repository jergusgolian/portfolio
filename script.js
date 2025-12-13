const nav = document.querySelector('nav');
const hamburger = document.querySelector('.hamburger-toggle');
const navLinks = document.querySelectorAll('nav ul li');
const indicator = document.querySelector('.indicator');
const homeLink = document.querySelector('nav a:first-child');

let userClicked = false; // <-- 1. NEW FLAG VARIABLE
let scrollTimeout; // Helper for the timeout

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

// --- EXISTING CLICK AND LOAD LOGIC ---
homeLink.classList.add('active'); 
window.onload = function() {
    window.scrollTo(0, 0);
    updateIndicatorPosition(homeLink);
};

// Click handler for navigation links (li elements)
navLinks.forEach(item => {
    item.addEventListener('click', (e) => {
        userClicked = true; // <-- 2. SET FLAG ON CLICK
        
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
        scrollTimeout = setTimeout(() => { userClicked = false; }, 1000); // 1 second
    });
});

// Click handler for the logo/main link
homeLink.addEventListener('click', (e) => {
    userClicked = true; // <-- 2. SET FLAG ON CLICK (also for home)
    
    navLinks.forEach(i => i.classList.remove('active'));
    homeLink.classList.add('active');
    updateIndicatorPosition(homeLink);
    
    setTimeout(() => {
        nav.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', false);
    }, 100);

    // Reset the flag after the smooth scroll is likely finished
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => { userClicked = false; }, 1000); // 1 second
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

// --- 🚀 SCROLL-SPY LOGIC ---
const sections = document.querySelectorAll('.main > div, #landing');
const observerOptions = {
    root: null, 
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
};

function observerCallback(entries) {
    if (userClicked) return; // <-- 3. CHECK FLAG (If user clicked, do nothing)
    
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
sections.forEach(sec => observer.observe(sec));


console.clear();

// Select the circle element
const circleElement = document.querySelector('.circle');
const scircleElement = document.querySelector('.small-circle');

// --- NEW: Add mousedown/mouseup listeners for 'clicked' state ---
document.addEventListener('mousedown', () => {
    scircleElement.classList.add('clicked');
});

document.addEventListener('mouseup', () => {
    scircleElement.classList.remove('clicked');
});

// --- NEW: Select all interactive elements ---
const interactiveElements = document.querySelectorAll('a, button, .web-button');

// Function to handle cursor class change on hover
function addHoverClass() {
    scircleElement.classList.add('hovering');
}

function removeHoverClass() {
    scircleElement.classList.remove('hovering');
}

// Add event listeners to all interactive elements
interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', addHoverClass);
    element.addEventListener('mouseleave', removeHoverClass);
});
// --- END NEW CODE ---

// Create objects to track mouse position and custom cursor position
const mouse = { x: 0, y: 0 }; // Track current mouse position
const previousMouse = { x: 0, y: 0 } // Store the previous mouse position
const circle = { x: 0, y: 0 }; // Track the circle position

// Initialize variables to track scaling and rotation
let currentScale = 0; // Track current scale value
let currentAngle = 0; // Track current angle value

// Update mouse position on the 'mousemove' event
window.addEventListener('mousemove', (e) => {
mouse.x = e.x;
mouse.y = e.y;
});

// Smoothing factor for cursor movement speed (0 = smoother, 1 = instant)
const speed = 0.5;

// Start animation
const tick = () => {
// MOVE
// Calculate circle movement based on mouse position and smoothing
circle.x += (mouse.x - circle.x) * speed;
circle.y += (mouse.y - circle.y) * speed;
// Create a transformation string for cursor translation
const translateTransform = `translate(${circle.x}px, ${circle.y}px)`;

// SQUEEZE
// 1. Calculate the change in mouse position (deltaMouse)
const deltaMouseX = mouse.x - previousMouse.x;
const deltaMouseY = mouse.y - previousMouse.y;
// Update previous mouse position for the next frame
previousMouse.x = mouse.x;
previousMouse.y = mouse.y;
// 2. Calculate mouse velocity using Pythagorean theorem and adjust speed
const mouseVelocity = Math.min(Math.sqrt(deltaMouseX**2 + deltaMouseY**2) * 4, 150); 
// 3. Convert mouse velocity to a value in the range [0, 0.5]
const scaleValue = (mouseVelocity / 150) * 0.5;
// 4. Smoothly update the current scale
currentScale += (scaleValue - currentScale) * speed;
// 5. Create a transformation string for scaling
let scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

// ROTATE
// 1. Calculate the angle using the atan2 function
const angle = Math.atan2(deltaMouseY, deltaMouseX) * 180 / Math.PI;
// 2. Check for a threshold to reduce shakiness at low mouse velocity
if (mouseVelocity > 20) {
    currentAngle = angle;
}
// 3. Create a transformation string for rotation
const rotateTransform = `rotate(${currentAngle}deg)`;

// Apply all transformations to the circle element in a specific order: translate -> rotate -> scale
circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;
scircleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;

// Request the next frame to continue the animation
window.requestAnimationFrame(tick);
}

// Start the animation loop
tick();