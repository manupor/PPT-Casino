/* ========================================
   CASINO PRESENTATION SLIDER - JAVASCRIPT
   ======================================== */

let currentSlide = 1;
const totalSlides = 12;
let isAnimating = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSlider();
    createNavigationDots();
    addKeyboardNavigation();
    addTouchNavigation();
    addMouseParallax();
});

/* ========================================
   SLIDER INITIALIZATION
   ======================================== */

function initializeSlider() {
    updateSlideCounter();
    updateNavigationDots();
    
    // Preload images for smooth transitions
    preloadImages();
}

function preloadImages() {
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => {
        const bg = slide.querySelector('.parallax-bg');
        if (bg) {
            const img = new Image();
            img.src = bg.style.backgroundImage.slice(5, -2);
        }
    });
}

/* ========================================
   SLIDE NAVIGATION
   ======================================== */

function nextSlide() {
    if (isAnimating) return;
    
    if (currentSlide < totalSlides) {
        changeSlide(currentSlide + 1);
    }
}

function prevSlide() {
    if (isAnimating) return;
    
    if (currentSlide > 1) {
        changeSlide(currentSlide - 1);
    }
}

function goToSlide(slideNumber) {
    if (isAnimating || slideNumber === currentSlide) return;
    changeSlide(slideNumber);
}

function changeSlide(newSlide) {
    if (newSlide < 1 || newSlide > totalSlides) return;
    
    isAnimating = true;
    
    const slides = document.querySelectorAll('.slide');
    const currentSlideElement = slides[currentSlide - 1];
    const newSlideElement = slides[newSlide - 1];
    
    // Remove active class from current slide
    currentSlideElement.classList.remove('active');
    
    // Add direction class for transition
    if (newSlide > currentSlide) {
        currentSlideElement.classList.add('prev');
        newSlideElement.classList.remove('next');
    } else {
        currentSlideElement.classList.add('next');
        newSlideElement.classList.remove('prev');
    }
    
    // Activate new slide
    setTimeout(() => {
        newSlideElement.classList.add('active');
        currentSlide = newSlide;
        
        updateSlideCounter();
        updateNavigationDots();
        
        // Update swipe hint visibility
        if (window.updateSwipeHint) {
            window.updateSwipeHint();
        }
        
        // Reset parallax
        resetParallax(newSlideElement);
        
        // Clean up classes after transition
        setTimeout(() => {
            slides.forEach(slide => {
                if (!slide.classList.contains('active')) {
                    slide.classList.remove('prev', 'next');
                }
            });
            isAnimating = false;
        }, 1000);
    }, 50);
}

/* ========================================
   NAVIGATION DOTS
   ======================================== */

function createNavigationDots() {
    const dotsContainer = document.querySelector('.nav-dots');
    
    for (let i = 1; i <= totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'nav-dot';
        dot.dataset.slide = i;
        
        if (i === 1) {
            dot.classList.add('active');
        }
        
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    }
    
    // Add dot styles dynamically
    addDotStyles();
}

function addDotStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .nav-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 215, 0, 0.3);
            border: 2px solid rgba(255, 215, 0, 0.5);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .nav-dot:hover {
            background: rgba(255, 215, 0, 0.6);
            transform: scale(1.2);
        }
        
        .nav-dot.active {
            background: var(--gold);
            border-color: var(--gold);
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
            transform: scale(1.3);
        }

        /* Mobile optimization - smaller dots like points */
        @media (max-width: 768px) {
            .nav-dot {
                width: 6px;
                height: 6px;
                border: 1px solid rgba(255, 215, 0, 0.6);
            }
            
            .nav-dot.active {
                transform: scale(1.3);
                border-width: 1px;
            }
        }

        @media (max-width: 480px) {
            .nav-dot {
                width: 5px;
                height: 5px;
                border: 1px solid rgba(255, 215, 0, 0.6);
            }
            
            .nav-dot.active {
                transform: scale(1.4);
                border-width: 1px;
            }
        }

        @media (max-width: 375px) {
            .nav-dot {
                width: 4px;
                height: 4px;
                border: 1px solid rgba(255, 215, 0, 0.6);
            }
            
            .nav-dot.active {
                transform: scale(1.5);
            }
        }
    `;
    document.head.appendChild(style);
}

function updateNavigationDots() {
    const dots = document.querySelectorAll('.nav-dot');
    dots.forEach((dot, index) => {
        if (index + 1 === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

/* ========================================
   SLIDE COUNTER
   ======================================== */

function updateSlideCounter() {
    const currentElement = document.querySelector('.current-slide');
    const totalElement = document.querySelector('.total-slides');
    
    currentElement.textContent = String(currentSlide).padStart(2, '0');
    totalElement.textContent = String(totalSlides).padStart(2, '0');
}

/* ========================================
   KEYBOARD NAVIGATION
   ======================================== */

function addKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (isAnimating) return;
        
        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                prevSlide();
                break;
            case 'Home':
                e.preventDefault();
                goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                goToSlide(totalSlides);
                break;
        }
    });
}

/* ========================================
   TOUCH NAVIGATION
   ======================================== */

function addTouchNavigation() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let hasSwipedOnce = false;
    
    const slider = document.querySelector('.slider-container');
    const swipeHint = document.querySelector('.swipe-hint');
    
    // Function to show/hide swipe hint based on current slide
    function updateSwipeHint() {
        if (swipeHint) {
            if (currentSlide === 1 && !hasSwipedOnce) {
                swipeHint.style.display = 'block';
                swipeHint.style.opacity = '1';
            } else {
                swipeHint.style.opacity = '0';
                setTimeout(() => {
                    swipeHint.style.display = 'none';
                }, 500);
            }
        }
    }
    
    // Show hint on first slide initially
    updateSwipeHint();
    
    slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 75; // Increased threshold for better control
        const horizontalDiff = touchEndX - touchStartX;
        const verticalDiff = touchEndY - touchStartY;
        
        // Check if it's primarily a horizontal swipe
        if (Math.abs(horizontalDiff) > Math.abs(verticalDiff) * 1.5) {
            // Horizontal swipe detected
            if (Math.abs(horizontalDiff) > swipeThreshold) {
                if (horizontalDiff > 0) {
                    // Swipe right - go to previous slide
                    prevSlide();
                } else {
                    // Swipe left - go to next slide
                    nextSlide();
                }
                
                // Mark as swiped and update hint visibility
                hasSwipedOnce = true;
                updateSwipeHint();
            }
        }
        // If it's a vertical swipe, let the browser handle scrolling
    }
    
    // Expose updateSwipeHint globally so changeSlide can call it
    window.updateSwipeHint = updateSwipeHint;
}

/* ========================================
   MOUSE PARALLAX EFFECT
   ======================================== */

function addMouseParallax() {
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    
    function animateParallax() {
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            const parallaxBg = activeSlide.querySelector('.parallax-bg');
            
            if (parallaxBg) {
                currentX += (mouseX - currentX) * 0.05;
                currentY += (mouseY - currentY) * 0.05;
                
                const translateX = currentX * 20;
                const translateY = currentY * 20;
                
                parallaxBg.style.transform = `scale(1.1) translate(${translateX}px, ${translateY}px)`;
            }
        }
        
        requestAnimationFrame(animateParallax);
    }
    
    animateParallax();
}

function resetParallax(slideElement) {
    const parallaxBg = slideElement.querySelector('.parallax-bg');
    if (parallaxBg) {
        parallaxBg.style.transform = 'scale(1)';
    }
}

/* ========================================
   SCROLL WHEEL NAVIGATION - DISABLED
   ======================================== */

// Scroll wheel navigation disabled to allow vertical scrolling within slides
// Users can now scroll to read content without changing slides
// To change slides, users must:
// - Click arrows (desktop)
// - Swipe (mobile)
// - Use keyboard navigation
// - Click navigation dots

/* ========================================
   AUTO-PLAY DISABLED
   ======================================== */

// Auto-play is intentionally disabled
// Slides only change by user interaction:
// - Click arrows (desktop)
// - Swipe (mobile)
// - Keyboard navigation
// - Click navigation dots

/* ========================================
   RESIZE HANDLER
   ======================================== */

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate positions if needed
        const activeSlide = document.querySelector('.slide.active');
        if (activeSlide) {
            resetParallax(activeSlide);
        }
    }, 250);
});

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for inline onclick handlers
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.goToSlide = goToSlide;

/* ========================================
   PERFORMANCE OPTIMIZATION
   ======================================== */

// Reduce motion for users who prefer it
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.slide').forEach(slide => {
        slide.style.transition = 'opacity 0.3s ease';
    });
}

// Log for debugging (remove in production)
console.log('🎰 Casino Presentation Slider Loaded');
console.log(`Total Slides: ${totalSlides}`);
console.log('Navigation: Arrow Keys, Swipe, Mouse Wheel, Click Arrows');
