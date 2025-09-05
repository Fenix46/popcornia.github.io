/**
 * Main Page JavaScript
 * Handles homepage functionality and interactions
 */

// Carousel functionality
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Show current slide
    if (slides[index]) {
        slides[index].classList.add('active');
        dots[index].classList.add('active');
    }
}

function changeSlide(direction) {
    currentSlide += direction;
    
    if (currentSlide >= slides.length) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    
    showSlide(currentSlide);
}

function currentSlideJump(index) {
    currentSlide = index - 1;
    showSlide(currentSlide);
}

// Auto-play carousel
function autoPlayCarousel() {
    setInterval(() => {
        changeSlide(1);
    }, 5000); // Change slide every 5 seconds
}

// FAQ functionality
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const isActive = faqItem.classList.contains('active');
    
    // Close all FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Open clicked item if it wasn't active
    if (!isActive) {
        faqItem.classList.add('active');
    }
}

// Device-based recommendations
function showDeviceRecommendation() {
    if (typeof deviceDetector !== 'undefined') {
        const deviceInfo = deviceDetector.getDeviceInfo();
        
        if (deviceInfo.isTV) {
            // Highlight TV download option
            const tvButton = document.querySelector('a[href="firestick-code.html"]');
            if (tvButton) {
                tvButton.classList.add('recommended');
                tvButton.innerHTML += ' <span class="recommended-badge">Consigliato per il tuo dispositivo</span>';
            }
        } else if (deviceInfo.isMobile) {
            // Highlight Android download option
            const androidButton = document.querySelector('a[href="download-android.html"]');
            if (androidButton) {
                androidButton.classList.add('recommended');
                androidButton.innerHTML += ' <span class="recommended-badge">Consigliato per il tuo dispositivo</span>';
            }
        }
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Parallax effects
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-bg');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .installation-card, .download-card').forEach(el => {
        observer.observe(el);
    });
}

// Feature card hover effects
function initFeatureCardEffects() {
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Download button analytics
function trackDownloadClicks() {
    document.querySelectorAll('a[href*="download"], a[href*="firestick-code"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonType = button.href.includes('download-android') ? 'android' : 'firestick';
            
            // Track with ads system
            if (typeof adsMonetization !== 'undefined') {
                adsMonetization.trackEvent('download_button_click', {
                    button_type: buttonType,
                    source_page: 'homepage'
                });
            }
            
            // Track with Google Analytics if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download_intent', {
                    method: buttonType,
                    source: 'homepage'
                });
            }
        });
    });
}

// Dynamic content updates
function updateDynamicContent() {
    // Update download counts (simulated)
    const downloadCountElement = document.querySelector('#download-count');
    if (downloadCountElement) {
        const baseCount = 15420;
        const randomIncrement = Math.floor(Math.random() * 50);
        downloadCountElement.textContent = (baseCount + randomIncrement).toLocaleString();
    }
    
    // Update last update time
    const lastUpdateElement = document.querySelector('#last-update');
    if (lastUpdateElement) {
        const now = new Date();
        lastUpdateElement.textContent = now.toLocaleDateString('it-IT');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize carousel
    if (slides.length > 0) {
        showSlide(currentSlide);
        autoPlayCarousel();
    }
    
    // Initialize other features
    initSmoothScrolling();
    initParallaxEffects();
    initScrollAnimations();
    initFeatureCardEffects();
    trackDownloadClicks();
    updateDynamicContent();
    
    // Device-specific recommendations (after device detection)
    setTimeout(showDeviceRecommendation, 1000);
    
    // Update dynamic content periodically
    setInterval(updateDynamicContent, 60000); // Every minute
});

// Keyboard navigation for TV devices
document.addEventListener('keydown', (e) => {
    if (typeof deviceDetector !== 'undefined' && deviceDetector.isTV()) {
        switch(e.key) {
            case 'ArrowLeft':
                if (document.activeElement.closest('.carousel')) {
                    e.preventDefault();
                    changeSlide(-1);
                }
                break;
            case 'ArrowRight':
                if (document.activeElement.closest('.carousel')) {
                    e.preventDefault();
                    changeSlide(1);
                }
                break;
        }
    }
});

// Export functions for global use
window.changeSlide = changeSlide;
window.currentSlide = currentSlideJump;
window.toggleFAQ = toggleFAQ;