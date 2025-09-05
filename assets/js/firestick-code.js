/**
 * FireStick Code Generation Page JavaScript
 * Handles the step-by-step code generation process
 */

class FireStickCodeGenerator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.generatedCode = null;
        this.stepTimers = {};
        
        this.init();
    }

    /**
     * Initialize code generator
     */
    init() {
        this.bindEvents();
        this.initializeStepSystem();
        
        // Start automatic progression after initial delay
        setTimeout(() => {
            if (!isAdBlockDetected || !isAdBlockDetected()) {
                this.startAutomaticProgression();
            }
        }, 3000);
    }

    /**
     * Initialize step system
     */
    initializeStepSystem() {
        // Show first step
        this.showStep(1);
        
        // Setup step indicators
        this.updateStepProgress();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Step continuation buttons
        const continueBtn = document.querySelector('.btn-continue');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.goToStep2());
        }

        // Copy code button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-copy, [onclick*="copyCode"]')) {
                this.copyGeneratedCode();
            }
        });

        // Refresh code button
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-refresh, [onclick*="generateNewCode"]')) {
                this.generateNewCode();
            }
        });
    }

    /**
     * Start automatic step progression
     */
    startAutomaticProgression() {
        // Auto-progress from step 1 to step 2 after 8 seconds
        this.stepTimers.step1 = setTimeout(() => {
            this.goToStep2();
        }, 8000);
    }

    /**
     * Show specific step
     */
    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.generation-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show target step
        const targetStep = document.getElementById(`step-${stepNumber}`);
        if (targetStep) {
            targetStep.classList.add('active');
            this.currentStep = stepNumber;
            this.updateStepProgress();
            
            // Focus first interactive element for TV users
            if (typeof deviceDetector !== 'undefined' && deviceDetector.isTV()) {
                setTimeout(() => {
                    const focusTarget = targetStep.querySelector('button, a, input');
                    if (focusTarget) focusTarget.focus();
                }, 500);
            }
        }
    }

    /**
     * Update step progress indicators
     */
    updateStepProgress() {
        document.querySelectorAll('.step-progress .progress-fill').forEach(progress => {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progress.style.width = `${percentage}%`;
        });
    }

    /**
     * Go to step 2 (Generation timer)
     */
    goToStep2() {
        console.log('Moving to step 2 - Generation timer');
        
        this.showStep(2);
        this.startGenerationTimer();
        
        // Track step progression
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('step_progression', {
                from_step: 1,
                to_step: 2
            });
        }
    }

    /**
     * Start generation countdown timer
     */
    startGenerationTimer() {
        let countdown = 10;
        const countdownElement = document.getElementById('generation-countdown');
        const countdownDisplay = document.getElementById('countdown-display-2');
        const countdownPath = document.getElementById('countdown-path-2');
        
        const updateCountdown = () => {
            if (countdownElement) countdownElement.textContent = countdown;
            if (countdownDisplay) countdownDisplay.textContent = countdown;
            
            // Update SVG circle
            if (countdownPath) {
                const circumference = 2 * Math.PI * 70;
                const progress = ((10 - countdown) / 10) * 100;
                const strokeDashoffset = circumference - (progress / 100) * circumference;
                countdownPath.style.strokeDashoffset = strokeDashoffset;
            }
            
            // Update status items
            this.updateGenerationStatus(10 - countdown);
        };

        updateCountdown();

        const timerInterval = setInterval(() => {
            countdown--;
            updateCountdown();
            
            if (countdown <= 0) {
                clearInterval(timerInterval);
                this.goToStep3();
            }
        }, 1000);
    }

    /**
     * Update generation status indicators
     */
    updateGenerationStatus(progress) {
        const statusItems = document.querySelectorAll('.status-item');
        
        statusItems.forEach((item, index) => {
            if (progress > index * 3) {
                item.classList.remove('pending');
                const icon = item.querySelector('i');
                if (icon && icon.classList.contains('fa-clock')) {
                    icon.className = 'fas fa-check-circle';
                }
            }
        });
    }

    /**
     * Go to step 3 (Code generation methods)
     */
    goToStep3() {
        console.log('Moving to step 3 - Code generation');
        
        this.showStep(3);
        this.startCodeGeneration();
        
        // Track step progression
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('step_progression', {
                from_step: 2,
                to_step: 3
            });
        }
    }

    /**
     * Start code generation process
     */
    async startCodeGeneration() {
        console.log('Starting code generation process...');
        
        // Method A: Try iframe method
        this.updateMethodStatus('method-a', 'trying');
        this.animateMethodProgress('method-a-progress', 0, 100, 3000);
        
        try {
            const result = await this.generateCodeViaDownloader();
            
            if (result.success) {
                this.updateMethodStatus('method-a', 'success');
                this.generatedCode = result.code;
                
                setTimeout(() => {
                    this.goToStep4();
                }, 1000);
                return;
            }
        } catch (error) {
            console.warn('Method A failed:', error);
        }
        
        // Method A failed, try Method B
        this.updateMethodStatus('method-a', 'failed');
        this.updateMethodStatus('method-b', 'trying');
        
        setTimeout(async () => {
            try {
                const result = await this.generateCodeViaPopup();
                
                if (result.success) {
                    this.updateMethodStatus('method-b', 'success');
                    this.generatedCode = result.code;
                    this.goToStep4();
                    return;
                }
            } catch (error) {
                console.warn('Method B failed:', error);
            }
            
            // Method B failed, use fallback
            this.updateMethodStatus('method-b', 'failed');
            this.updateMethodStatus('method-c', 'trying');
            
            setTimeout(() => {
                this.generatedCode = this.generateFallbackCode();
                this.updateMethodStatus('method-c', 'success');
                this.goToStep4();
            }, 2000);
        }, 2000);
    }

    /**
     * Generate code via Downloader integration
     */
    async generateCodeViaDownloader() {
        if (typeof downloaderIntegration !== 'undefined') {
            return await downloaderIntegration.generateCode();
        }
        
        // Fallback if integration not available
        return {
            success: true,
            code: this.generateRandomCode(),
            method: 'fallback'
        };
    }

    /**
     * Generate code via popup method
     */
    async generateCodeViaPopup() {
        // Simulate popup method
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    code: this.generateRandomCode(),
                    method: 'popup'
                });
            }, 1000);
        });
    }

    /**
     * Generate fallback code
     */
    generateFallbackCode() {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    /**
     * Generate random 5-digit code
     */
    generateRandomCode() {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    /**
     * Update method status indicator
     */
    updateMethodStatus(methodId, status) {
        const methodCard = document.getElementById(methodId);
        if (!methodCard) return;
        
        const statusBadge = methodCard.querySelector('.status-badge');
        if (!statusBadge) return;
        
        // Remove old status classes
        statusBadge.className = 'status-badge';
        methodCard.className = 'method-card';
        
        // Add new status
        statusBadge.classList.add(status);
        methodCard.classList.add(status);
        
        // Update text
        const statusTexts = {
            trying: 'Tentativo in corso...',
            success: 'Completato ✓',
            failed: 'Fallito ✗'
        };
        
        statusBadge.textContent = statusTexts[status] || status;
    }

    /**
     * Animate method progress bar
     */
    animateMethodProgress(progressId, from, to, duration) {
        const progressBar = document.querySelector(`#${progressId} .progress-fill`);
        if (!progressBar) return;
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            if (progress < 1) {
                const currentValue = from + (to - from) * progress;
                progressBar.style.width = `${currentValue}%`;
                requestAnimationFrame(animate);
            } else {
                progressBar.style.width = `${to}%`;
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Go to step 4 (Display generated code)
     */
    goToStep4() {
        console.log('Moving to step 4 - Display code');
        
        this.showStep(4);
        this.displayGeneratedCode();
        
        // Track successful generation
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('code_generated_success', {
                code: this.generatedCode,
                step: 4
            });
        }
    }

    /**
     * Display the generated code
     */
    displayGeneratedCode() {
        const codeElement = document.getElementById('generated-code');
        const displayCodeElement = document.getElementById('display-code');
        
        if (codeElement && this.generatedCode) {
            codeElement.textContent = this.generatedCode;
            
            // Animate code appearance
            codeElement.style.transform = 'scale(0)';
            setTimeout(() => {
                codeElement.style.transform = 'scale(1)';
                codeElement.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            }, 100);
        }
        
        if (displayCodeElement && this.generatedCode) {
            displayCodeElement.textContent = this.generatedCode;
        }
        
        // Generate QR code
        this.generateQRCode();
        
        // Start typing animation
        this.startTypingAnimation();
        
        // Auto-progress to instructions after 5 seconds
        setTimeout(() => {
            this.goToStep5();
        }, 5000);
    }

    /**
     * Generate QR code for mobile access
     */
    generateQRCode() {
        const qrElement = document.getElementById('qr-code');
        if (qrElement && typeof QRCode !== 'undefined' && this.generatedCode) {
            qrElement.innerHTML = ''; // Clear previous QR code
            
            const qrUrl = `${window.location.origin}/c/${this.generatedCode}`;
            new QRCode(qrElement, {
                text: qrUrl,
                width: 128,
                height: 128,
                colorDark: '#000000',
                colorLight: '#ffffff'
            });
        }
    }

    /**
     * Start typing animation for instructions
     */
    startTypingAnimation() {
        const typingElement = document.getElementById('typing-animation');
        if (typingElement && this.generatedCode) {
            let i = 0;
            const typeSpeed = 200;
            
            const typeWriter = () => {
                if (i < this.generatedCode.length) {
                    typingElement.textContent = this.generatedCode.substring(0, i + 1);
                    i++;
                    setTimeout(typeWriter, typeSpeed);
                }
            };
            
            // Start typing animation after 2 seconds
            setTimeout(typeWriter, 2000);
        }
    }

    /**
     * Go to step 5 (Instructions)
     */
    goToStep5() {
        console.log('Moving to step 5 - Instructions');
        
        this.showStep(5);
        
        // Track completion
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('firestick_process_complete', {
                code: this.generatedCode,
                total_steps: this.totalSteps
            });
        }
    }

    /**
     * Copy generated code to clipboard
     */
    copyGeneratedCode() {
        if (!this.generatedCode) return;
        
        navigator.clipboard.writeText(this.generatedCode).then(() => {
            this.showCopySuccess();
            
            // Track copy action
            if (typeof adsMonetization !== 'undefined') {
                adsMonetization.trackEvent('code_copied', {
                    code: this.generatedCode
                });
            }
        }).catch(() => {
            // Fallback for older browsers
            this.fallbackCopyCode();
        });
    }

    /**
     * Fallback copy method for older browsers
     */
    fallbackCopyCode() {
        const textArea = document.createElement('textarea');
        textArea.value = this.generatedCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.showCopySuccess();
    }

    /**
     * Show copy success message
     */
    showCopySuccess() {
        const message = document.createElement('div');
        message.className = 'copy-success-message';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Codice copiato: ${this.generatedCode}</span>
        `;
        
        // Add styles
        const style = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.5s ease-out;
        `;
        
        message.style.cssText = style;
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    /**
     * Generate new code
     */
    async generateNewCode() {
        console.log('Generating new code...');
        
        // Go back to step 3 and regenerate
        this.showStep(3);
        await this.startCodeGeneration();
        
        // Track new code generation
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('new_code_requested', {
                previous_code: this.generatedCode
            });
        }
    }

    /**
     * Get generation statistics
     */
    getStats() {
        return {
            currentStep: this.currentStep,
            totalSteps: this.totalSteps,
            generatedCode: this.generatedCode,
            activeTimers: Object.keys(this.stepTimers).length
        };
    }
}

// Initialize FireStick code generator
let fireStickGenerator;
document.addEventListener('DOMContentLoaded', () => {
    fireStickGenerator = new FireStickCodeGenerator();
});

// Global functions for HTML interaction
function goToStep2() {
    if (fireStickGenerator) {
        fireStickGenerator.goToStep2();
    }
}

function copyCode() {
    if (fireStickGenerator) {
        fireStickGenerator.copyGeneratedCode();
    }
}

function generateNewCode() {
    if (fireStickGenerator) {
        fireStickGenerator.generateNewCode();
    }
}

// Export for debugging
window.fireStickGenerator = fireStickGenerator;