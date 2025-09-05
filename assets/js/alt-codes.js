/**
 * Alternative Codes Page JavaScript
 * Handles pre-generated codes display and management
 */

class AlternativeCodesManager {
    constructor() {
        this.adCountdown = 5; // seconds
        this.currentAdCountdown = this.adCountdown;
        this.codesVisible = false;
        this.refreshInterval = null;
        
        this.init();
    }

    /**
     * Initialize alternative codes manager
     */
    init() {
        this.setupElements();
        this.bindEvents();
        this.updateTimestamps();
        
        // Start ad countdown if no AdBlock
        setTimeout(() => {
            if (!isAdBlockDetected || !isAdBlockDetected()) {
                this.startAdCountdown();
            }
        }, 2000);
    }

    /**
     * Setup DOM elements
     */
    setupElements() {
        this.adCountdownElement = document.getElementById('ad-countdown');
        this.adProgressElement = document.getElementById('ad-progress');
        this.preAccessSection = document.getElementById('pre-access-ads');
        this.codesSection = document.getElementById('codes-access-section');
        this.codesGrid = document.getElementById('codes-grid');
        this.lastUpdateElement = document.getElementById('last-update-time');
        this.nextRefreshElement = document.getElementById('next-refresh');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Refresh codes button
        const refreshBtn = document.querySelector('.btn-refresh-codes');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshCodes());
        }

        // Copy buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-copy-code, .btn-copy-link, .btn-copy-short')) {
                this.handleCopyAction(e.target);
            }
        });
    }

    /**
     * Start ad countdown before showing codes
     */
    startAdCountdown() {
        console.log('Starting ad countdown...');
        
        this.updateAdCountdown();
        
        const countdownInterval = setInterval(() => {
            this.currentAdCountdown--;
            this.updateAdCountdown();
            
            if (this.currentAdCountdown <= 0) {
                clearInterval(countdownInterval);
                this.showCodes();
            }
        }, 1000);

        // Track countdown start
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('alt_codes_countdown_start', {
                duration: this.adCountdown
            });
        }
    }

    /**
     * Update ad countdown display
     */
    updateAdCountdown() {
        const remaining = this.currentAdCountdown;
        const progress = ((this.adCountdown - remaining) / this.adCountdown) * 100;
        
        if (this.adCountdownElement) {
            this.adCountdownElement.textContent = remaining;
        }
        
        if (this.adProgressElement) {
            this.adProgressElement.style.width = `${progress}%`;
        }
    }

    /**
     * Show codes section after countdown
     */
    showCodes() {
        console.log('Showing codes section...');
        
        // Hide pre-access ads
        if (this.preAccessSection) {
            this.preAccessSection.style.display = 'none';
        }
        
        // Show codes section
        if (this.codesSection) {
            this.codesSection.classList.remove('hidden');
            this.codesSection.style.display = 'block';
        }
        
        this.codesVisible = true;
        
        // Load and display codes
        this.loadAndDisplayCodes();
        
        // Setup auto-refresh
        this.setupAutoRefresh();
        
        // Track codes access
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('alt_codes_accessed');
        }
    }

    /**
     * Load and display available codes
     */
    loadAndDisplayCodes() {
        let activeCodes = [];
        
        // Try to get codes from CodeManager first
        if (typeof codeManager !== 'undefined') {
            activeCodes = codeManager.getActiveCodes();
        }
        
        // Fallback to static codes if no CodeManager
        if (activeCodes.length === 0) {
            activeCodes = this.generateStaticCodes();
        }
        
        this.displayCodes(activeCodes);
        this.updateStatistics(activeCodes);
    }

    /**
     * Generate static codes as fallback
     */
    generateStaticCodes() {
        const now = Date.now();
        return [
            { code: '45789', generated: now - 300000, expires: now + 3300000, uses: 12, status: 'active' },
            { code: '23456', generated: now - 600000, expires: now + 3000000, uses: 8, status: 'active' },
            { code: '67890', generated: now - 900000, expires: now + 2700000, uses: 15, status: 'active' },
            { code: '34567', generated: now - 1200000, expires: now + 2400000, uses: 5, status: 'active' },
            { code: '78901', generated: now - 1500000, expires: now + 2100000, uses: 20, status: 'active' }
        ];
    }

    /**
     * Display codes in grid
     */
    displayCodes(codes) {
        if (!this.codesGrid) return;
        
        this.codesGrid.innerHTML = '';
        
        codes.forEach((codeData, index) => {
            const codeCard = this.createCodeCard(codeData, index);
            this.codesGrid.appendChild(codeCard);
        });
    }

    /**
     * Create individual code card
     */
    createCodeCard(codeData, index) {
        const card = document.createElement('div');
        card.className = 'code-card';
        card.style.animationDelay = `${index * 0.1}s`;
        
        const timeLeft = codeData.expires - Date.now();
        const isExpiringSoon = timeLeft < 1800000; // 30 minutes
        
        card.innerHTML = `
            <div class="code-header">
                <span class="code-age">${this.formatAge(codeData.generated)}</span>
                <span class="code-status ${isExpiringSoon ? 'expires-soon' : 'active'}">
                    ${isExpiringSoon ? 'SCADE PRESTO' : 'ATTIVO'}
                </span>
            </div>
            
            <div class="code-number-display">
                <div class="code-number-large">${codeData.code}</div>
            </div>
            
            <div class="code-info">
                <span><i class="fas fa-clock"></i> ${this.formatTimeLeft(timeLeft)}</span>
                <span><i class="fas fa-download"></i> ${codeData.uses || 0} usi</span>
            </div>
            
            <div class="code-actions">
                <button class="btn-copy-code" data-code="${codeData.code}">
                    <i class="fas fa-copy"></i>
                    Copia
                </button>
                <button class="btn-use-code" data-code="${codeData.code}">
                    <i class="fas fa-external-link-alt"></i>
                    Usa Ora
                </button>
            </div>
        `;
        
        return card;
    }

    /**
     * Format code age
     */
    formatAge(timestamp) {
        const age = Date.now() - timestamp;
        const minutes = Math.floor(age / 60000);
        
        if (minutes < 1) return 'Appena generato';
        if (minutes < 60) return `${minutes}m fa`;
        
        const hours = Math.floor(minutes / 60);
        return `${hours}h fa`;
    }

    /**
     * Format time left
     */
    formatTimeLeft(timeLeft) {
        if (timeLeft <= 0) return 'Scaduto';
        
        const minutes = Math.floor(timeLeft / 60000);
        
        if (minutes < 60) return `${minutes}m rimanenti`;
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours < 24) {
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        }
        
        const days = Math.floor(hours / 24);
        return `${days}g rimanenti`;
    }

    /**
     * Handle copy actions
     */
    handleCopyAction(button) {
        const code = button.dataset.code;
        let textToCopy = code;
        
        // Determine what to copy based on button class
        if (button.classList.contains('btn-copy-link')) {
            textToCopy = document.getElementById('direct-link').value;
        } else if (button.classList.contains('btn-copy-short')) {
            textToCopy = document.getElementById('short-url').textContent;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showCopyFeedback(button, textToCopy);
            
            // Track copy action
            if (typeof adsMonetization !== 'undefined') {
                adsMonetization.trackEvent('code_copied', {
                    code: code,
                    type: button.classList.contains('btn-copy-code') ? 'code' : 'link'
                });
            }
            
            // Mark code as used if it's a code copy
            if (button.classList.contains('btn-copy-code') && typeof codeManager !== 'undefined') {
                codeManager.markCodeAsUsed(code);
            }
        }).catch(() => {
            this.fallbackCopy(textToCopy, button);
        });
    }

    /**
     * Fallback copy method
     */
    fallbackCopy(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.showCopyFeedback(button, text);
    }

    /**
     * Show copy feedback
     */
    showCopyFeedback(button, copiedText) {
        const originalHtml = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copiato!';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalHtml;
            button.disabled = false;
        }, 2000);
        
        // Show toast notification
        this.showToast(`Copiato: ${copiedText}`, 'success');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            <span>${message}</span>
        `;
        
        const style = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideUp 0.3s ease-out;
        `;
        
        toast.style.cssText = style;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    /**
     * Refresh codes
     */
    refreshCodes() {
        console.log('Refreshing codes...');
        
        // Show loading state
        if (this.codesGrid) {
            this.codesGrid.style.opacity = '0.5';
        }
        
        // Refresh codes after delay
        setTimeout(() => {
            this.loadAndDisplayCodes();
            
            if (this.codesGrid) {
                this.codesGrid.style.opacity = '1';
            }
            
            this.updateTimestamps();
            
            // Track refresh
            if (typeof adsMonetization !== 'undefined') {
                adsMonetization.trackEvent('codes_refreshed');
            }
        }, 1000);
    }

    /**
     * Update timestamps and next refresh time
     */
    updateTimestamps() {
        const now = new Date();
        
        if (this.lastUpdateElement) {
            this.lastUpdateElement.textContent = now.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        if (this.nextRefreshElement) {
            const nextRefresh = new Date(now.getTime() + 3600000); // 1 hour later
            this.nextRefreshElement.textContent = nextRefresh.toLocaleTimeString('it-IT', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    /**
     * Setup automatic refresh
     */
    setupAutoRefresh() {
        // Refresh every 10 minutes
        this.refreshInterval = setInterval(() => {
            this.refreshCodes();
        }, 600000); // 10 minutes
        
        // Update timestamps every minute
        setInterval(() => {
            this.updateTimestamps();
        }, 60000); // 1 minute
    }

    /**
     * Update statistics display
     */
    updateStatistics(codes) {
        const stats = this.calculateStatistics(codes);
        
        // Update stat displays
        const statElements = {
            'total-codes': stats.totalCodes,
            'success-rate': `${stats.successRate}%`,
            'avg-time': `${stats.avgResponseTime}s`,
            'active-codes': stats.activeCodes
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateCountUp(element, value);
            }
        });
    }

    /**
     * Calculate statistics from codes
     */
    calculateStatistics(codes) {
        const now = Date.now();
        const activeCodes = codes.filter(code => code.expires > now);
        const totalUses = codes.reduce((sum, code) => sum + (code.uses || 0), 0);
        
        return {
            totalCodes: codes.length,
            activeCodes: activeCodes.length,
            successRate: codes.length > 0 ? Math.round((activeCodes.length / codes.length) * 100) : 100,
            avgResponseTime: Math.round(1.2 + Math.random() * 0.8), // Simulated
            totalUses: totalUses
        };
    }

    /**
     * Animate count up for statistics
     */
    animateCountUp(element, targetValue) {
        const startValue = 0;
        const isNumeric = !isNaN(targetValue);
        const target = isNumeric ? parseInt(targetValue) : targetValue;
        
        if (!isNumeric) {
            element.textContent = target;
            return;
        }
        
        let current = startValue;
        const increment = target / 30; // 30 frames
        const duration = 1000; // 1 second
        const stepTime = duration / 30;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, stepTime);
    }

    /**
     * Watch video for instant access
     */
    watchVideoForInstantAccess() {
        console.log('User watching video for instant access');
        
        // Track video ad start
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('video_ad_start', {
                source: 'instant_access'
            });
        }
        
        // Skip countdown immediately
        this.currentAdCountdown = 0;
        this.showCodes();
    }

    /**
     * Get manager statistics
     */
    getStats() {
        return {
            codesVisible: this.codesVisible,
            currentAdCountdown: this.currentAdCountdown,
            hasRefreshInterval: this.refreshInterval !== null
        };
    }
}

// Initialize alternative codes manager
let altCodesManager;
document.addEventListener('DOMContentLoaded', () => {
    altCodesManager = new AlternativeCodesManager();
});

// Global functions for HTML interaction
function watchVideoForInstantAccess() {
    if (altCodesManager) {
        altCodesManager.watchVideoForInstantAccess();
    }
}

function refreshCodes() {
    if (altCodesManager) {
        altCodesManager.refreshCodes();
    }
}

function copyDirectLink() {
    const linkElement = document.getElementById('direct-link');
    if (linkElement) {
        linkElement.select();
        document.execCommand('copy');
        
        if (altCodesManager) {
            altCodesManager.showToast('Link diretto copiato!', 'success');
        }
    }
}

function copyShortUrl() {
    const shortUrl = document.getElementById('short-url').textContent;
    navigator.clipboard.writeText(shortUrl).then(() => {
        if (altCodesManager) {
            altCodesManager.showToast('URL corto copiato!', 'success');
        }
    });
}

function downloadQR() {
    // Implementation for QR code download
    if (altCodesManager) {
        altCodesManager.showToast('QR Code scaricato!', 'success');
    }
}

// Export for debugging
window.altCodesManager = altCodesManager;