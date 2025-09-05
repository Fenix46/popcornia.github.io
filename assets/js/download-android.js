/**
 * Download Android Page JavaScript
 * Handles APK download flow with ads and countdown
 */

class AndroidDownloadManager {
    constructor() {
        this.countdownDuration = 15; // seconds
        this.currentCountdown = this.countdownDuration;
        this.countdownInterval = null;
        this.downloadReady = false;
        
        this.init();
    }

    /**
     * Initialize download manager
     */
    init() {
        this.setupCountdownElements();
        this.bindEvents();
        
        // Start countdown if no AdBlock detected
        setTimeout(() => {
            if (!isAdBlockDetected || !isAdBlockDetected()) {
                this.startDownloadCountdown();
            }
        }, 2000);
    }

    /**
     * Setup countdown elements
     */
    setupCountdownElements() {
        this.countdownElement = document.getElementById('countdown');
        this.countdownDisplay = document.getElementById('countdown-display');
        this.progressFill = document.getElementById('progress-fill');
        this.countdownMessage = document.getElementById('countdown-message');
        this.preDownloadAds = document.getElementById('pre-download-ads');
        this.downloadReady = document.getElementById('download-ready');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Video ad skip button
        const videoSkipBtn = document.querySelector('.btn-video');
        if (videoSkipBtn) {
            videoSkipBtn.addEventListener('click', () => this.watchVideoAd());
        }

        // Download link tracking
        const downloadLink = document.getElementById('download-link');
        if (downloadLink) {
            downloadLink.addEventListener('click', (e) => this.trackDownload(e));
        }
    }

    /**
     * Start download countdown
     */
    startDownloadCountdown() {
        if (this.countdownInterval) return; // Already running

        console.log('Starting download countdown...');
        
        this.updateCountdownDisplay();
        
        this.countdownInterval = setInterval(() => {
            this.currentCountdown--;
            this.updateCountdownDisplay();
            
            if (this.currentCountdown <= 0) {
                this.completeCountdown();
            }
        }, 1000);

        // Track countdown start
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('download_countdown_start', {
                duration: this.countdownDuration
            });
        }
    }

    /**
     * Update countdown display
     */
    updateCountdownDisplay() {
        const remaining = this.currentCountdown;
        const progress = ((this.countdownDuration - remaining) / this.countdownDuration) * 100;
        
        // Update countdown numbers
        if (this.countdownElement) {
            this.countdownElement.textContent = remaining;
        }
        if (this.countdownDisplay) {
            this.countdownDisplay.textContent = remaining;
        }
        
        // Update progress bar
        if (this.progressFill) {
            this.progressFill.style.width = `${progress}%`;
        }
        
        // Update SVG countdown circle
        this.updateCountdownCircle(progress);
        
        // Update message
        this.updateCountdownMessage(remaining);
    }

    /**
     * Update countdown circle SVG
     */
    updateCountdownCircle(progress) {
        const circle = document.getElementById('countdown-path');
        if (circle) {
            const circumference = 2 * Math.PI * 70; // radius = 70
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (progress / 100) * circumference;
            
            circle.style.strokeDasharray = strokeDasharray;
            circle.style.strokeDashoffset = strokeDashoffset;
        }
    }

    /**
     * Update countdown message
     */
    updateCountdownMessage(remaining) {
        if (!this.countdownMessage) return;
        
        const messages = [
            'Attendi per favore, stiamo preparando il tuo file APK',
            'Verifica sicurezza del file in corso...',
            'Ottimizzazione per il tuo dispositivo...',
            'Generazione link di download...',
            'Quasi pronto! Ultimi controlli...'
        ];
        
        const messageIndex = Math.floor((this.countdownDuration - remaining) / (this.countdownDuration / messages.length));
        const message = messages[Math.min(messageIndex, messages.length - 1)];
        
        this.countdownMessage.textContent = message;
    }

    /**
     * Complete countdown and show download
     */
    completeCountdown() {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
        
        console.log('Countdown completed, showing download');
        
        // Hide ads section
        if (this.preDownloadAds) {
            this.preDownloadAds.style.display = 'none';
        }
        
        // Show download section
        if (this.downloadReadySection) {
            this.downloadReadySection.classList.remove('hidden');
        } else {
            // Fallback: find and show download section
            const downloadSection = document.getElementById('download-ready');
            if (downloadSection) {
                downloadSection.classList.remove('hidden');
                downloadSection.style.display = 'block';
            }
        }
        
        this.downloadReady = true;
        
        // Auto-focus download button for TV users
        if (typeof deviceDetector !== 'undefined' && deviceDetector.isTV()) {
            const downloadBtn = document.getElementById('download-link');
            if (downloadBtn) {
                setTimeout(() => downloadBtn.focus(), 500);
            }
        }
        
        // Track completion
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('download_countdown_complete');
        }
    }

    /**
     * Handle video ad watching for skip
     */
    watchVideoAd() {
        console.log('User chose to watch video ad');
        
        // Track video ad start
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('video_ad_start', {
                source: 'download_skip'
            });
        }
        
        // Simulate video ad watching (30 seconds)
        const videoAdDuration = 30;
        let videoCountdown = videoAdDuration;
        
        // Update video button text
        const videoBtn = document.querySelector('.btn-video');
        if (videoBtn) {
            const originalText = videoBtn.innerHTML;
            
            const videoInterval = setInterval(() => {
                videoCountdown--;
                videoBtn.innerHTML = `<i class="fas fa-video"></i> Video in corso... ${videoCountdown}s`;
                
                if (videoCountdown <= 0) {
                    clearInterval(videoInterval);
                    videoBtn.innerHTML = '<i class="fas fa-check"></i> Video Completato!';
                    videoBtn.disabled = true;
                    
                    // Skip countdown
                    this.skipCountdown();
                }
            }, 1000);
        }
    }

    /**
     * Skip countdown (from video ad)
     */
    skipCountdown() {
        console.log('Skipping countdown via video ad');
        
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        this.completeCountdown();
        
        // Track skip
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('countdown_skipped', {
                method: 'video_ad'
            });
        }
    }

    /**
     * Track actual download
     */
    trackDownload(event) {
        console.log('APK download started');
        
        // Track download
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('apk_download_start', {
                file_size: '25.6MB',
                source: 'android_download_page'
            });
        }
        
        // Track with Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'file_download', {
                file_name: 'MiaApp.apk',
                file_extension: 'apk',
                source: 'download_page'
            });
        }
        
        // Show download success message after delay
        setTimeout(() => {
            this.showDownloadSuccess();
        }, 2000);
    }

    /**
     * Show download success message
     */
    showDownloadSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'download-success-toast';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <div class="success-text">
                    <h4>Download Iniziato!</h4>
                    <p>Il file MiaApp.apk è stato scaricato nella cartella Download</p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .download-success-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                padding: 20px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                z-index: 10000;
                animation: slideInRight 0.5s ease-out;
                max-width: 400px;
            }
            
            .success-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .success-content i.fa-check-circle {
                font-size: 2rem;
                color: #22c55e;
            }
            
            .success-text h4 {
                margin: 0 0 5px 0;
                font-size: 1.2rem;
            }
            
            .success-text p {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.9;
            }
            
            .success-content button {
                background: transparent;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.2rem;
                padding: 5px;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }
            
            .success-content button:hover {
                background: rgba(255,255,255,0.2);
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        
        if (!document.querySelector('#success-toast-styles')) {
            style.id = 'success-toast-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(successMessage);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (successMessage.parentElement) {
                successMessage.remove();
            }
        }, 10000);
    }

    /**
     * Reset countdown (for debugging)
     */
    resetCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        this.currentCountdown = this.countdownDuration;
        this.downloadReady = false;
        
        // Show ads section
        if (this.preDownloadAds) {
            this.preDownloadAds.style.display = 'block';
        }
        
        // Hide download section
        if (this.downloadReadySection) {
            this.downloadReadySection.classList.add('hidden');
        }
        
        console.log('Countdown reset');
    }

    /**
     * Get download statistics
     */
    getStats() {
        return {
            countdownDuration: this.countdownDuration,
            currentCountdown: this.currentCountdown,
            downloadReady: this.downloadReady,
            isRunning: this.countdownInterval !== null
        };
    }
}

// Initialize download manager
let downloadManager;
document.addEventListener('DOMContentLoaded', () => {
    downloadManager = new AndroidDownloadManager();
});

// Global functions for debugging
function resetDownloadCountdown() {
    if (downloadManager) {
        downloadManager.resetCountdown();
    }
}

function skipDownloadCountdown() {
    if (downloadManager) {
        downloadManager.skipCountdown();
    }
}

function getDownloadStats() {
    return downloadManager ? downloadManager.getStats() : null;
}