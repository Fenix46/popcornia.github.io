/**
 * Ads Monetization Module
 * Handles ad display, AdBlock detection, and revenue optimization
 */

class AdsMonetization {
    constructor() {
        this.adBlockDetected = false;
        this.adBlockChecked = false;
        this.viewportVisible = true;
        this.adInteractionCount = 0;
        this.sessionStartTime = Date.now();
        
        // Revenue tracking
        this.adImpressions = 0;
        this.adClicks = 0;
        this.estimatedRevenue = 0;
        
        // Initialize monetization
        this.init();
    }

    /**
     * Initialize ads system
     */
    init() {
        this.detectAdBlock();
        this.initializeViewportTracking();
        this.initializeAdRefresh();
        this.trackPageMetrics();
        this.initializeAntiAdBlock();
        
        // Lazy load ads for better performance
        this.lazyLoadAds();
    }

    /**
     * Detect if user has AdBlock enabled
     */
    detectAdBlock() {
        // Create a test element that AdBlock would block
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox adsbygoogle ad-placement';
        testAd.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px;';
        
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            this.adBlockDetected = testAd.offsetHeight === 0 || testAd.style.display === 'none';
            this.adBlockChecked = true;
            
            testAd.remove();
            
            if (this.adBlockDetected) {
                this.handleAdBlockDetected();
            }
            
            // Track AdBlock statistics
            this.trackAdBlockStatus();
        }, 100);
    }

    /**
     * Handle AdBlock detection
     */
    handleAdBlockDetected() {
        console.log('AdBlock detected');
        
        // Show AdBlock overlay after a delay
        setTimeout(() => {
            this.showAdBlockOverlay();
        }, 3000);
        
        // Track user behavior with AdBlock
        this.trackAdBlockBehavior();
    }

    /**
     * Show AdBlock overlay
     */
    showAdBlockOverlay() {
        const overlay = document.getElementById('adb-overlay');
        if (overlay && overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            
            // Track overlay show
            this.trackEvent('adb_overlay_shown');
            
            // Focus on disable button for TV users
            if (isTVDevice && isTVDevice()) {
                const disableBtn = overlay.querySelector('.btn');
                if (disableBtn) {
                    setTimeout(() => disableBtn.focus(), 500);
                }
            }
        }
    }

    /**
     * Check if AdBlock is still enabled
     */
    checkAdBlock() {
        if (!this.adBlockChecked) {
            this.detectAdBlock();
            return;
        }
        
        // Re-test for AdBlock
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px;';
        
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            const stillBlocked = testAd.offsetHeight === 0;
            testAd.remove();
            
            if (!stillBlocked && this.adBlockDetected) {
                // AdBlock was disabled
                this.adBlockDetected = false;
                this.handleAdBlockDisabled();
            } else if (stillBlocked && !this.adBlockDetected) {
                // AdBlock was enabled
                this.adBlockDetected = true;
                this.handleAdBlockDetected();
            }
        }, 100);
    }

    /**
     * Handle AdBlock being disabled
     */
    handleAdBlockDisabled() {
        console.log('AdBlock disabled');
        
        // Hide overlay
        const overlay = document.getElementById('adb-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        // Show success message
        this.showAdBlockDisabledMessage();
        
        // Refresh ads
        this.refreshAllAds();
        
        // Track conversion
        this.trackEvent('adb_disabled', { conversion: true });
    }

    /**
     * Show AdBlock disabled success message
     */
    showAdBlockDisabledMessage() {
        const message = document.createElement('div');
        message.className = 'adb-success-message';
        message.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>Grazie!</h3>
                <p>AdBlock è stato disabilitato. Ora puoi accedere a tutti i contenuti.</p>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    /**
     * Initialize viewport tracking for ad visibility
     */
    initializeViewportTracking() {
        // Track when ads come into viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.trackAdImpression(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all ad containers
        document.querySelectorAll('.ad-placeholder, .ad-banner, .ad-rectangle').forEach(ad => {
            observer.observe(ad);
        });
        
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.viewportVisible = !document.hidden;
        });
    }

    /**
     * Initialize ad refresh system
     */
    initializeAdRefresh() {
        // Refresh ads every 30 seconds if visible
        setInterval(() => {
            if (this.viewportVisible && !this.adBlockDetected) {
                this.refreshVisibleAds();
            }
        }, 30000);
    }

    /**
     * Track ad impression
     */
    trackAdImpression(adElement) {
        if (this.adBlockDetected) return;
        
        this.adImpressions++;
        this.estimatedRevenue += 0.001; // Rough estimate
        
        // Mark as viewed
        adElement.classList.add('ad-viewed');
        
        // Track with analytics
        this.trackEvent('ad_impression', {
            ad_type: this.getAdType(adElement),
            ad_position: this.getAdPosition(adElement)
        });
    }

    /**
     * Track ad click
     */
    trackAdClick(adElement) {
        if (this.adBlockDetected) return;
        
        this.adClicks++;
        this.adInteractionCount++;
        this.estimatedRevenue += 0.05; // Rough estimate
        
        // Track with analytics
        this.trackEvent('ad_click', {
            ad_type: this.getAdType(adElement),
            ad_position: this.getAdPosition(adElement)
        });
    }

    /**
     * Get ad type from element
     */
    getAdType(element) {
        if (element.classList.contains('ad-banner')) return 'banner';
        if (element.classList.contains('ad-rectangle')) return 'rectangle';
        if (element.classList.contains('sticky-ad')) return 'sticky';
        if (element.classList.contains('video-ad')) return 'video';
        return 'unknown';
    }

    /**
     * Get ad position from element
     */
    getAdPosition(element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const elementTop = rect.top + scrollTop;
        
        if (elementTop < window.innerHeight) return 'above-fold';
        if (elementTop < window.innerHeight * 2) return 'middle-fold';
        return 'below-fold';
    }

    /**
     * Refresh all ads
     */
    refreshAllAds() {
        document.querySelectorAll('.ad-placeholder').forEach(ad => {
            this.refreshAd(ad);
        });
    }

    /**
     * Refresh visible ads only
     */
    refreshVisibleAds() {
        document.querySelectorAll('.ad-placeholder').forEach(ad => {
            const rect = ad.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                this.refreshAd(ad);
            }
        });
    }

    /**
     * Refresh individual ad
     */
    refreshAd(adElement) {
        if (this.adBlockDetected) return;
        
        // Add loading animation
        adElement.classList.add('loading');
        
        // Simulate ad refresh (replace with actual ad network code)
        setTimeout(() => {
            adElement.classList.remove('loading');
            this.trackEvent('ad_refresh');
        }, 1000);
    }

    /**
     * Initialize anti-AdBlock measures
     */
    initializeAntiAdBlock() {
        // Check for common AdBlock extensions
        this.checkForAdBlockExtensions();
        
        // Monitor DOM modifications typical of AdBlock
        this.monitorDOMModifications();
        
        // Periodic checks
        setInterval(() => {
            this.checkAdBlock();
        }, 10000);
    }

    /**
     * Check for AdBlock extensions
     */
    checkForAdBlockExtensions() {
        const extensions = ['adBlock', 'adBlockPlus', 'uBlock'];
        
        extensions.forEach(ext => {
            if (window[ext] || document.querySelector(`[data-extension="${ext}"]`)) {
                this.adBlockDetected = true;
                this.handleAdBlockDetected();
            }
        });
    }

    /**
     * Monitor DOM modifications
     */
    monitorDOMModifications() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('ad-placeholder')) {
                        // Ad element was removed, possibly by AdBlock
                        this.adBlockDetected = true;
                        this.handleAdBlockDetected();
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Lazy load ads for better performance
     */
    lazyLoadAds() {
        const adObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadAd(entry.target);
                    adObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '100px' });
        
        document.querySelectorAll('.ad-placeholder.loading').forEach(ad => {
            adObserver.observe(ad);
        });
    }

    /**
     * Load individual ad
     */
    loadAd(adElement) {
        if (this.adBlockDetected) return;
        
        // Simulate ad loading (replace with actual ad network code)
        setTimeout(() => {
            adElement.classList.remove('loading');
            adElement.classList.add('loaded');
            
            // Track ad load
            this.trackEvent('ad_loaded', {
                ad_type: this.getAdType(adElement)
            });
        }, Math.random() * 2000 + 1000);
    }

    /**
     * Close sticky ad
     */
    closeStickyAd() {
        const stickyAds = document.querySelectorAll('.sticky-ad, .sticky-ad-download, .sticky-ad-firestick, .sticky-ad-alt');
        stickyAds.forEach(ad => {
            ad.style.display = 'none';
        });
        
        this.trackEvent('sticky_ad_closed');
    }

    /**
     * Track page metrics
     */
    trackPageMetrics() {
        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - this.sessionStartTime;
            this.trackEvent('page_time', { duration: timeOnPage });
        });
        
        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
            maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
            
            // Track scroll milestones
            if (scrollDepth > 0.25 && !this.scrolled25) {
                this.scrolled25 = true;
                this.trackEvent('scroll_depth', { depth: 25 });
            }
            if (scrollDepth > 0.5 && !this.scrolled50) {
                this.scrolled50 = true;
                this.trackEvent('scroll_depth', { depth: 50 });
            }
            if (scrollDepth > 0.75 && !this.scrolled75) {
                this.scrolled75 = true;
                this.trackEvent('scroll_depth', { depth: 75 });
            }
        });
        
        // Track page unload with max scroll depth
        window.addEventListener('beforeunload', () => {
            this.trackEvent('page_exit', { max_scroll_depth: maxScrollDepth });
        });
    }

    /**
     * Track AdBlock behavior
     */
    trackAdBlockBehavior() {
        // Track how long users stay with AdBlock
        const adBlockStartTime = Date.now();
        
        const trackAdBlockSession = () => {
            const duration = Date.now() - adBlockStartTime;
            this.trackEvent('adblock_session', {
                duration: duration,
                interactions: this.adInteractionCount
            });
        };
        
        window.addEventListener('beforeunload', trackAdBlockSession);
    }

    /**
     * Track AdBlock status
     */
    trackAdBlockStatus() {
        this.trackEvent('adblock_detection', {
            adblock_detected: this.adBlockDetected,
            user_agent: navigator.userAgent
        });
    }

    /**
     * Track events with analytics
     */
    trackEvent(eventName, parameters = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...parameters,
                ad_impressions: this.adImpressions,
                ad_clicks: this.adClicks,
                estimated_revenue: this.estimatedRevenue
            });
        }
        
        // Console logging for debugging
        console.log(`Event: ${eventName}`, parameters);
    }

    /**
     * Get monetization statistics
     */
    getStats() {
        return {
            adBlockDetected: this.adBlockDetected,
            adImpressions: this.adImpressions,
            adClicks: this.adClicks,
            estimatedRevenue: this.estimatedRevenue,
            adInteractionCount: this.adInteractionCount,
            sessionDuration: Date.now() - this.sessionStartTime
        };
    }

    /**
     * Optimize ad placement based on device
     */
    optimizeForDevice() {
        if (typeof deviceDetector !== 'undefined') {
            const deviceInfo = deviceDetector.getDeviceInfo();
            
            if (deviceInfo.isTV) {
                // Larger ads for TV
                this.enlargeAdsForTV();
            } else if (deviceInfo.isMobile) {
                // Mobile-optimized ads
                this.optimizeAdsForMobile();
            }
        }
    }

    /**
     * Enlarge ads for TV viewing
     */
    enlargeAdsForTV() {
        const style = document.createElement('style');
        style.textContent = `
            .tv-device .ad-placeholder {
                min-height: 150px;
                font-size: 1.2rem;
            }
            
            .tv-device .ad-rectangle {
                min-height: 300px;
            }
            
            .tv-device .ad-banner {
                min-height: 120px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Optimize ads for mobile
     */
    optimizeAdsForMobile() {
        // Smaller, mobile-friendly ad sizes
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .ad-banner {
                    min-height: 60px;
                }
                
                .ad-rectangle {
                    min-height: 200px;
                }
                
                .sticky-ad {
                    position: relative !important;
                    bottom: auto !important;
                    margin: 20px 0 !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize ads system
let adsMonetization;
document.addEventListener('DOMContentLoaded', () => {
    adsMonetization = new AdsMonetization();
    
    // Optimize for detected device
    setTimeout(() => {
        adsMonetization.optimizeForDevice();
    }, 1000);
});

// Global functions for use in HTML
function checkAdBlock() {
    if (adsMonetization) {
        adsMonetization.checkAdBlock();
    }
}

function isAdBlockDetected() {
    return adsMonetization ? adsMonetization.adBlockDetected : false;
}

function closeStickyAd() {
    if (adsMonetization) {
        adsMonetization.closeStickyAd();
    }
}

function trackAdClick(element) {
    if (adsMonetization) {
        adsMonetization.trackAdClick(element);
    }
}

// Export for use in other modules
window.AdsMonetization = AdsMonetization;
if (typeof module !== 'undefined') {
    module.exports = AdsMonetization;
}