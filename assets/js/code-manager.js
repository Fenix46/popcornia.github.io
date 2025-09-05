/**
 * Code Manager Module
 * Manages pre-generated codes and rotation system
 */

class CodeManager {
    constructor() {
        this.preGeneratedCodes = [];
        this.rotationInterval = 3600000; // 1 hour
        this.maxCodes = 20;
        this.minActiveCodes = 5;
        
        this.init();
    }

    /**
     * Initialize code manager
     */
    init() {
        this.loadPreGeneratedCodes();
        this.setupAutoRotation();
        this.generateInitialCodes();
    }

    /**
     * Load pre-generated codes from localStorage
     */
    loadPreGeneratedCodes() {
        try {
            const stored = localStorage.getItem('pregenerated_codes');
            if (stored) {
                this.preGeneratedCodes = JSON.parse(stored);
                this.cleanExpiredCodes();
            } else {
                this.createInitialCodeSet();
            }
        } catch (error) {
            console.warn('Error loading pre-generated codes:', error);
            this.createInitialCodeSet();
        }
    }

    /**
     * Create initial set of codes
     */
    createInitialCodeSet() {
        const now = Date.now();
        const codes = [
            { code: '45789', generated: now - 300000, expires: now + 3300000, status: 'active', uses: 0 },
            { code: '23456', generated: now - 600000, expires: now + 3000000, status: 'active', uses: 0 },
            { code: '67890', generated: now - 900000, expires: now + 2700000, status: 'active', uses: 0 },
            { code: '34567', generated: now - 1200000, expires: now + 2400000, status: 'active', uses: 0 },
            { code: '78901', generated: now - 1500000, expires: now + 2100000, status: 'active', uses: 0 },
            { code: '12345', generated: now - 1800000, expires: now + 1800000, status: 'active', uses: 0 },
            { code: '56789', generated: now - 2100000, expires: now + 1500000, status: 'active', uses: 0 },
            { code: '98765', generated: now - 2400000, expires: now + 1200000, status: 'active', uses: 0 }
        ];

        this.preGeneratedCodes = codes;
        this.savePreGeneratedCodes();
    }

    /**
     * Generate new codes
     */
    generateNewCodes(count = 5) {
        const now = Date.now();
        const newCodes = [];

        for (let i = 0; i < count; i++) {
            const code = {
                code: this.generateUniqueCode(),
                generated: now + (i * 60000), // Stagger by 1 minute
                expires: now + this.rotationInterval + (i * 60000),
                status: 'active',
                uses: 0
            };
            
            newCodes.push(code);
        }

        this.preGeneratedCodes.push(...newCodes);
        this.trimCodeList();
        this.savePreGeneratedCodes();

        return newCodes;
    }

    /**
     * Generate unique 5-digit code
     */
    generateUniqueCode() {
        let code;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            code = Math.floor(10000 + Math.random() * 90000).toString();
            attempts++;
        } while (
            this.preGeneratedCodes.some(c => c.code === code) && 
            attempts < maxAttempts
        );

        return code;
    }

    /**
     * Get active codes
     */
    getActiveCodes() {
        const now = Date.now();
        return this.preGeneratedCodes
            .filter(code => code.expires > now && code.status === 'active')
            .sort((a, b) => b.generated - a.generated);
    }

    /**
     * Get next available code
     */
    getNextCode() {
        const activeCodes = this.getActiveCodes();
        
        if (activeCodes.length === 0) {
            // Generate emergency code
            const emergencyCode = this.generateEmergencyCode();
            return emergencyCode;
        }

        // Return least used code
        const sortedCodes = activeCodes.sort((a, b) => a.uses - b.uses);
        const selectedCode = sortedCodes[0];
        
        // Increment usage
        selectedCode.uses++;
        this.savePreGeneratedCodes();

        return selectedCode;
    }

    /**
     * Generate emergency code when no codes available
     */
    generateEmergencyCode() {
        const now = Date.now();
        const emergencyCode = {
            code: this.generateUniqueCode(),
            generated: now,
            expires: now + 3600000, // 1 hour
            status: 'emergency',
            uses: 1
        };

        this.preGeneratedCodes.push(emergencyCode);
        this.savePreGeneratedCodes();

        return emergencyCode;
    }

    /**
     * Mark code as used
     */
    markCodeAsUsed(codeString) {
        const code = this.preGeneratedCodes.find(c => c.code === codeString);
        if (code) {
            code.uses++;
            code.lastUsed = Date.now();
            this.savePreGeneratedCodes();
        }
    }

    /**
     * Validate code
     */
    validateCode(codeString) {
        const code = this.preGeneratedCodes.find(c => c.code === codeString);
        
        if (!code) {
            return { valid: false, reason: 'Code not found' };
        }

        if (code.expires < Date.now()) {
            return { valid: false, reason: 'Code expired' };
        }

        if (code.status !== 'active' && code.status !== 'emergency') {
            return { valid: false, reason: 'Code inactive' };
        }

        return {
            valid: true,
            code: code,
            timeLeft: code.expires - Date.now(),
            uses: code.uses
        };
    }

    /**
     * Clean expired codes
     */
    cleanExpiredCodes() {
        const now = Date.now();
        const beforeCount = this.preGeneratedCodes.length;
        
        this.preGeneratedCodes = this.preGeneratedCodes.filter(code => {
            // Keep codes that expire in the future or were used recently
            return code.expires > now || (code.lastUsed && (now - code.lastUsed) < 300000); // 5 minutes grace
        });

        const cleanedCount = beforeCount - this.preGeneratedCodes.length;
        
        if (cleanedCount > 0) {
            this.savePreGeneratedCodes();
            console.log(`Cleaned ${cleanedCount} expired codes`);
        }

        return cleanedCount;
    }

    /**
     * Trim code list to maximum size
     */
    trimCodeList() {
        if (this.preGeneratedCodes.length > this.maxCodes) {
            // Sort by expiry date and keep the newest ones
            this.preGeneratedCodes.sort((a, b) => b.expires - a.expires);
            this.preGeneratedCodes = this.preGeneratedCodes.slice(0, this.maxCodes);
        }
    }

    /**
     * Setup automatic code rotation
     */
    setupAutoRotation() {
        // Rotate codes every hour
        setInterval(() => {
            this.rotateActiveCodes();
        }, this.rotationInterval);

        // Check and maintain minimum codes every 10 minutes
        setInterval(() => {
            this.maintainCodePool();
        }, 600000); // 10 minutes

        // Clean expired codes every 5 minutes
        setInterval(() => {
            this.cleanExpiredCodes();
        }, 300000); // 5 minutes
    }

    /**
     * Rotate active codes
     */
    rotateActiveCodes() {
        console.log('Rotating active codes...');
        
        // Clean expired codes first
        this.cleanExpiredCodes();
        
        // Generate new codes if needed
        const activeCodes = this.getActiveCodes();
        if (activeCodes.length < this.minActiveCodes) {
            const needed = this.minActiveCodes - activeCodes.length;
            this.generateNewCodes(needed);
            console.log(`Generated ${needed} new codes during rotation`);
        }

        // Mark old codes for retirement (but don't remove immediately)
        const now = Date.now();
        this.preGeneratedCodes.forEach(code => {
            if (code.expires < now + 1800000 && code.status === 'active') { // 30 minutes before expiry
                code.status = 'retiring';
            }
        });

        this.savePreGeneratedCodes();
    }

    /**
     * Maintain minimum code pool
     */
    maintainCodePool() {
        const activeCodes = this.getActiveCodes();
        
        if (activeCodes.length < this.minActiveCodes) {
            const needed = this.minActiveCodes - activeCodes.length;
            this.generateNewCodes(needed);
            console.log(`Maintaining code pool: generated ${needed} codes`);
        }
    }

    /**
     * Generate initial codes on startup
     */
    generateInitialCodes() {
        const activeCodes = this.getActiveCodes();
        
        if (activeCodes.length < this.minActiveCodes) {
            const needed = this.minActiveCodes - activeCodes.length;
            setTimeout(() => {
                this.generateNewCodes(needed);
                console.log(`Initial code generation: created ${needed} codes`);
            }, 2000);
        }
    }

    /**
     * Save pre-generated codes to localStorage
     */
    savePreGeneratedCodes() {
        try {
            localStorage.setItem('pregenerated_codes', JSON.stringify(this.preGeneratedCodes));
            localStorage.setItem('codes_last_update', Date.now().toString());
        } catch (error) {
            console.warn('Error saving pre-generated codes:', error);
        }
    }

    /**
     * Get code statistics
     */
    getCodeStats() {
        const now = Date.now();
        const activeCodes = this.getActiveCodes();
        const expiringSoon = activeCodes.filter(code => code.expires < now + 1800000); // 30 minutes
        const totalUses = this.preGeneratedCodes.reduce((sum, code) => sum + code.uses, 0);
        const averageUses = this.preGeneratedCodes.length > 0 ? totalUses / this.preGeneratedCodes.length : 0;

        return {
            totalCodes: this.preGeneratedCodes.length,
            activeCodes: activeCodes.length,
            expiringSoon: expiringSoon.length,
            totalUses: totalUses,
            averageUses: Math.round(averageUses * 100) / 100,
            lastUpdate: localStorage.getItem('codes_last_update') || 'Never',
            nextRotation: this.getNextRotationTime()
        };
    }

    /**
     * Get next rotation time
     */
    getNextRotationTime() {
        const lastUpdate = parseInt(localStorage.getItem('codes_last_update') || '0');
        const nextRotation = lastUpdate + this.rotationInterval;
        return new Date(nextRotation);
    }

    /**
     * Force code rotation
     */
    forceRotation() {
        console.log('Forcing code rotation...');
        this.rotateActiveCodes();
        
        // Track forced rotation
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('forced_code_rotation');
        }
    }

    /**
     * Export codes for backup
     */
    exportCodes() {
        const exportData = {
            codes: this.preGeneratedCodes,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Import codes from backup
     */
    importCodes(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            if (importData.codes && Array.isArray(importData.codes)) {
                this.preGeneratedCodes = importData.codes;
                this.cleanExpiredCodes();
                this.savePreGeneratedCodes();
                return { success: true, imported: importData.codes.length };
            } else {
                return { success: false, error: 'Invalid data format' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Reset all codes (for debugging)
     */
    resetCodes() {
        this.preGeneratedCodes = [];
        this.createInitialCodeSet();
        console.log('All codes reset');
        
        // Track reset
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('codes_reset');
        }
    }
}

// Initialize code manager
let codeManager;
document.addEventListener('DOMContentLoaded', () => {
    codeManager = new CodeManager();
});

// Global functions for use in HTML
function getNextAvailableCode() {
    return codeManager ? codeManager.getNextCode() : null;
}

function getAllActiveCodes() {
    return codeManager ? codeManager.getActiveCodes() : [];
}

function validateCodeExists(code) {
    return codeManager ? codeManager.validateCode(code) : { valid: false };
}

function markCodeUsed(code) {
    if (codeManager) {
        codeManager.markCodeAsUsed(code);
    }
}

function forceCodeRotation() {
    if (codeManager) {
        codeManager.forceRotation();
    }
}

function getCodeStatistics() {
    return codeManager ? codeManager.getCodeStats() : {};
}

// Export for use in other modules
window.CodeManager = CodeManager;
if (typeof module !== 'undefined') {
    module.exports = CodeManager;
}