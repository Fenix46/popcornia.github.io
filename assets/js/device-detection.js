/**
 * Device Detection Module
 * Detects Android TV, FireStick, and other devices for optimized experience
 */

class DeviceDetector {
    constructor() {
        this.userAgent = navigator.userAgent.toLowerCase();
        this.platform = navigator.platform?.toLowerCase() || '';
        this.deviceInfo = this.detectDevice();
        
        // Initialize device-specific optimizations
        this.initializeDeviceOptimizations();
    }

    /**
     * Detect device type based on user agent and other indicators
     */
    detectDevice() {
        const info = {
            isFireStick: false,
            isAndroidTV: false,
            isAndroidPhone: false,
            isAndroidTablet: false,
            isMobile: false,
            isTV: false,
            deviceType: 'unknown',
            recommendedMethod: 'android-apk'
        };

        // FireStick detection
        if (this.userAgent.includes('afts') || 
            this.userAgent.includes('aftm') || 
            this.userAgent.includes('aftb') || 
            this.userAgent.includes('afta') ||
            this.userAgent.includes('firetv')) {
            info.isFireStick = true;
            info.isTV = true;
            info.deviceType = 'firestick';
            info.recommendedMethod = 'downloader-code';
        }
        // Android TV detection
        else if (this.userAgent.includes('android') && 
                (this.userAgent.includes('tv') || 
                 this.userAgent.includes('googletv') ||
                 this.userAgent.includes('chromecast') ||
                 this.userAgent.includes('androidtv'))) {
            info.isAndroidTV = true;
            info.isTV = true;
            info.deviceType = 'androidtv';
            info.recommendedMethod = 'downloader-code';
        }
        // Android Phone/Tablet detection
        else if (this.userAgent.includes('android')) {
            info.isMobile = true;
            
            // Check if it's a tablet (rough estimation)
            const isTablet = window.screen.width >= 768 || 
                           this.userAgent.includes('tablet') ||
                           (window.screen.width > window.screen.height && window.screen.width >= 1024);
            
            if (isTablet) {
                info.isAndroidTablet = true;
                info.deviceType = 'android-tablet';
            } else {
                info.isAndroidPhone = true;
                info.deviceType = 'android-phone';
            }
            info.recommendedMethod = 'android-apk';
        }
        // Generic mobile detection
        else if (/mobi|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(this.userAgent)) {
            info.isMobile = true;
            info.deviceType = 'mobile';
            info.recommendedMethod = 'android-apk';
        }

        return info;
    }

    /**
     * Initialize device-specific optimizations
     */
    initializeDeviceOptimizations() {
        // Add device classes to body
        document.body.classList.add(`device-${this.deviceInfo.deviceType}`);
        
        if (this.deviceInfo.isTV) {
            document.body.classList.add('tv-device');
            this.enableTVOptimizations();
        }
        
        if (this.deviceInfo.isMobile) {
            document.body.classList.add('mobile-device');
            this.enableMobileOptimizations();
        }

        // Set custom CSS properties
        document.documentElement.style.setProperty('--device-type', `"${this.deviceInfo.deviceType}"`);
    }

    /**
     * Enable TV-specific optimizations
     */
    enableTVOptimizations() {
        // Larger touch targets
        document.body.style.setProperty('--min-touch-target', '48px');
        
        // Better focus indication
        this.enhanceFocusIndicators();
        
        // Keyboard navigation
        this.enableKeyboardNavigation();
        
        // Auto-redirect to appropriate page if on TV
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            this.showTVRecommendation();
        }
    }

    /**
     * Enable mobile-specific optimizations
     */
    enableMobileOptimizations() {
        // Disable sticky ads on small screens
        if (window.innerWidth < 768) {
            this.disableStickyAds();
        }
        
        // Optimize scroll behavior
        document.body.style.setProperty('scroll-behavior', 'smooth');
    }

    /**
     * Enhance focus indicators for TV navigation
     */
    enhanceFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .tv-device *:focus {
                outline: 3px solid #667eea;
                outline-offset: 3px;
                box-shadow: 0 0 0 6px rgba(102, 126, 234, 0.3);
            }
            
            .tv-device button:focus,
            .tv-device a:focus,
            .tv-device input:focus {
                transform: scale(1.05);
                transition: transform 0.2s ease;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Enable keyboard navigation for TV remotes
     */
    enableKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const focusableElements = this.getFocusableElements();
            const currentIndex = focusableElements.indexOf(document.activeElement);
            
            switch(e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    e.preventDefault();
                    this.focusNextElement(focusableElements, currentIndex);
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    e.preventDefault();
                    this.focusPreviousElement(focusableElements, currentIndex);
                    break;
                case 'Enter':
                case ' ':
                    if (document.activeElement && document.activeElement.click) {
                        e.preventDefault();
                        document.activeElement.click();
                    }
                    break;
            }
        });
    }

    /**
     * Get all focusable elements on the page
     */
    getFocusableElements() {
        const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
        return Array.from(document.querySelectorAll(selector)).filter(el => {
            return el.offsetWidth > 0 && el.offsetHeight > 0 && !el.disabled;
        });
    }

    /**
     * Focus next element in sequence
     */
    focusNextElement(elements, currentIndex) {
        const nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0;
        elements[nextIndex].focus();
    }

    /**
     * Focus previous element in sequence
     */
    focusPreviousElement(elements, currentIndex) {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1;
        elements[prevIndex].focus();
    }

    /**
     * Show TV-specific recommendation banner
     */
    showTVRecommendation() {
        if (this.deviceInfo.isTV) {
            const banner = this.createTVBanner();
            document.body.insertBefore(banner, document.body.firstChild);
            
            // Auto-focus the TV recommendation button
            setTimeout(() => {
                const tvButton = banner.querySelector('.btn-tv-recommendation');
                if (tvButton) tvButton.focus();
            }, 1000);
        }
    }

    /**
     * Create TV recommendation banner
     */
    createTVBanner() {
        const banner = document.createElement('div');
        banner.className = 'tv-recommendation-banner';
        banner.innerHTML = `
            <div class="tv-banner-content">
                <div class="tv-banner-icon">
                    <i class="fas fa-tv"></i>
                </div>
                <div class="tv-banner-text">
                    <h3>Dispositivo TV Rilevato!</h3>
                    <p>Per la migliore esperienza su ${this.deviceInfo.isFireStick ? 'FireStick' : 'Android TV'}, usa il sistema di codici Downloader</p>
                </div>
                <div class="tv-banner-actions">
                    <a href="firestick-code.html" class="btn-tv-recommendation">
                        <i class="fas fa-code"></i>
                        Ottieni Codice Ora
                    </a>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-tv-dismiss">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .tv-recommendation-banner {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                animation: slideDown 0.5s ease-out;
            }
            
            .tv-banner-content {
                display: flex;
                align-items: center;
                gap: 20px;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .tv-banner-icon i {
                font-size: 2.5rem;
                color: #4facfe;
            }
            
            .tv-banner-text h3 {
                margin: 0 0 5px 0;
                font-size: 1.5rem;
            }
            
            .tv-banner-text p {
                margin: 0;
                opacity: 0.9;
            }
            
            .tv-banner-actions {
                margin-left: auto;
                display: flex;
                gap: 10px;
            }
            
            .btn-tv-recommendation {
                background: rgba(255,255,255,0.2);
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                text-decoration: none;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
            }
            
            .btn-tv-recommendation:focus,
            .btn-tv-recommendation:hover {
                background: rgba(255,255,255,0.3);
                transform: scale(1.05);
            }
            
            .btn-tv-dismiss {
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .btn-tv-dismiss:hover {
                background: rgba(255,255,255,0.2);
                transform: scale(1.1);
            }
            
            @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }
            
            @media (max-width: 768px) {
                .tv-banner-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 15px;
                }
                
                .tv-banner-actions {
                    margin-left: 0;
                }
            }
        `;
        
        if (!document.querySelector('#tv-banner-styles')) {
            style.id = 'tv-banner-styles';
            document.head.appendChild(style);
        }
        
        return banner;
    }

    /**
     * Disable sticky ads on small screens
     */
    disableStickyAds() {
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .sticky-ad,
                .sticky-ad-download,
                .sticky-ad-firestick,
                .sticky-ad-alt {
                    position: relative !important;
                    bottom: auto !important;
                    margin: 20px 0 !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Get device information
     */
    getDeviceInfo() {
        return { ...this.deviceInfo };
    }

    /**
     * Check if device is TV
     */
    isTV() {
        return this.deviceInfo.isTV;
    }

    /**
     * Check if device is mobile
     */
    isMobile() {
        return this.deviceInfo.isMobile;
    }

    /**
     * Get recommended download method
     */
    getRecommendedMethod() {
        return this.deviceInfo.recommendedMethod;
    }

    /**
     * Track device analytics
     */
    trackDeviceAnalytics() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'device_detected', {
                device_type: this.deviceInfo.deviceType,
                is_tv: this.deviceInfo.isTV,
                is_mobile: this.deviceInfo.isMobile,
                recommended_method: this.deviceInfo.recommendedMethod
            });
        }

        // Store device info in localStorage for later use
        localStorage.setItem('deviceInfo', JSON.stringify(this.deviceInfo));
    }

    /**
     * Auto-redirect based on device type
     */
    autoRedirect(options = {}) {
        const { 
            enableAutoRedirect = false,
            delay = 5000,
            showNotification = true 
        } = options;

        if (!enableAutoRedirect) return;

        if (this.deviceInfo.isTV && window.location.pathname === '/') {
            if (showNotification) {
                this.showRedirectNotification('firestick-code.html', delay);
            } else {
                setTimeout(() => {
                    window.location.href = 'firestick-code.html';
                }, delay);
            }
        }
    }

    /**
     * Show redirect notification
     */
    showRedirectNotification(targetUrl, delay) {
        const notification = document.createElement('div');
        notification.className = 'redirect-notification';
        notification.innerHTML = `
            <div class="redirect-content">
                <i class="fas fa-info-circle"></i>
                <p>Ti reindirizzeremo alla pagina ottimale per il tuo dispositivo TV tra <span id="redirect-timer">${delay/1000}</span> secondi</p>
                <div class="redirect-actions">
                    <button onclick="window.location.href='${targetUrl}'" class="btn-redirect-now">Vai Ora</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-redirect-cancel">Annulla</button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Countdown timer
        let timeLeft = delay / 1000;
        const timer = setInterval(() => {
            timeLeft--;
            const timerEl = document.getElementById('redirect-timer');
            if (timerEl) timerEl.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                window.location.href = targetUrl;
            }
        }, 1000);

        // Auto-remove notification if user dismisses it
        notification.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-redirect-cancel')) {
                clearInterval(timer);
                notification.remove();
            }
        });
    }
}

// Initialize device detector
let deviceDetector;
document.addEventListener('DOMContentLoaded', () => {
    deviceDetector = new DeviceDetector();
    deviceDetector.trackDeviceAnalytics();
    
    // Auto-redirect can be enabled per page
    // deviceDetector.autoRedirect({ enableAutoRedirect: true, delay: 8000 });
});

// Export for use in other modules
window.DeviceDetector = DeviceDetector;
if (typeof module !== 'undefined') {
    module.exports = DeviceDetector;
}

/**
 * Utility functions for device detection
 */
function detectAndroidTV() {
    return deviceDetector ? deviceDetector.getDeviceInfo().isAndroidTV : false;
}

function isFireStick() {
    return deviceDetector ? deviceDetector.getDeviceInfo().isFireStick : false;
}

function isTVDevice() {
    return deviceDetector ? deviceDetector.isTV() : false;
}

function isMobileDevice() {
    return deviceDetector ? deviceDetector.isMobile() : false;
}

function getRecommendedDownloadMethod() {
    return deviceDetector ? deviceDetector.getRecommendedMethod() : 'android-apk';
}