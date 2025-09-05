/**
 * Instructions Page JavaScript
 * Handles device switching and interactive tutorials
 */

class InstructionsManager {
    constructor() {
        this.currentDevice = 'firestick';
        this.openFAQs = new Set();
        
        this.init();
    }

    /**
     * Initialize instructions manager
     */
    init() {
        this.bindEvents();
        this.initializeDeviceSwitching();
        this.initializeFAQs();
        this.setupScrollAnimations();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Device switching buttons
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const deviceType = this.getDeviceFromButton(btn);
                this.showDeviceInstructions(deviceType);
            });
        });

        // FAQ items
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                this.toggleFAQ(question);
            });
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    this.smoothScrollTo(target);
                }
            });
        });

        // Quick action buttons
        document.querySelectorAll('.btn-quick-link').forEach(btn => {
            btn.addEventListener('click', () => {
                this.trackQuickAction(btn);
            });
        });
    }

    /**
     * Get device type from button
     */
    getDeviceFromButton(button) {
        if (button.textContent.includes('FireStick')) return 'firestick';
        if (button.textContent.includes('Android TV')) return 'androidtv';
        if (button.textContent.includes('Android')) return 'android';
        return 'firestick';
    }

    /**
     * Initialize device switching
     */
    initializeDeviceSwitching() {
        // Set initial device based on detection
        if (typeof deviceDetector !== 'undefined') {
            const deviceInfo = deviceDetector.getDeviceInfo();
            
            if (deviceInfo.isFireStick) {
                this.currentDevice = 'firestick';
            } else if (deviceInfo.isAndroidTV) {
                this.currentDevice = 'androidtv';
            } else if (deviceInfo.isMobile) {
                this.currentDevice = 'android';
            }
        }
        
        // Show appropriate device instructions
        this.showDeviceInstructions(this.currentDevice);
    }

    /**
     * Show instructions for specific device
     */
    showDeviceInstructions(deviceType) {
        console.log(`Switching to ${deviceType} instructions`);
        
        // Update current device
        this.currentDevice = deviceType;
        
        // Hide all device instructions
        document.querySelectorAll('.device-instructions').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target device instructions
        const targetSection = document.getElementById(`${deviceType}-instructions`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Scroll to instructions if not in viewport
            setTimeout(() => {
                if (!this.isInViewport(targetSection)) {
                    this.smoothScrollTo(targetSection, -100);
                }
            }, 100);
        }
        
        // Update button states
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`.device-btn[onclick*="${deviceType}"]`) || 
                           Array.from(document.querySelectorAll('.device-btn')).find(btn => 
                               this.getDeviceFromButton(btn) === deviceType
                           );
        
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Track device selection
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('device_instructions_selected', {
                device_type: deviceType
            });
        }
    }

    /**
     * Initialize FAQ functionality
     */
    initializeFAQs() {
        // Set up FAQ toggle behavior
        document.querySelectorAll('.faq-item').forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');
            
            if (question && answer) {
                // Set initial state
                answer.style.maxHeight = '0';
                answer.style.overflow = 'hidden';
                answer.style.transition = 'max-height 0.3s ease';
            }
        });
    }

    /**
     * Toggle FAQ item
     */
    toggleFAQ(questionElement) {
        const faqItem = questionElement.closest('.faq-item');
        const answer = faqItem.querySelector('.faq-answer');
        const icon = questionElement.querySelector('i');
        
        if (!faqItem || !answer) return;
        
        const isOpen = faqItem.classList.contains('active');
        
        if (isOpen) {
            // Close FAQ
            faqItem.classList.remove('active');
            answer.style.maxHeight = '0';
            if (icon) icon.style.transform = 'rotate(0deg)';
            this.openFAQs.delete(faqItem);
        } else {
            // Close other FAQs (optional - comment out for accordion behavior)
            this.closeAllFAQs();
            
            // Open FAQ
            faqItem.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            if (icon) icon.style.transform = 'rotate(180deg)';
            this.openFAQs.add(faqItem);
        }
        
        // Track FAQ interaction
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('faq_toggle', {
                question: questionElement.textContent.trim(),
                action: isOpen ? 'close' : 'open'
            });
        }
    }

    /**
     * Close all FAQs
     */
    closeAllFAQs() {
        document.querySelectorAll('.faq-item.active').forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                this.toggleFAQ(question);
            }
        });
    }

    /**
     * Setup scroll animations
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    
                    // Animate step cards with stagger
                    if (entry.target.classList.contains('instruction-step')) {
                        const steps = entry.target.parentElement.querySelectorAll('.instruction-step');
                        steps.forEach((step, index) => {
                            setTimeout(() => {
                                step.classList.add('animate-in');
                            }, index * 100);
                        });
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.instruction-step, .trouble-card, .prereq-card, .video-container').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Smooth scroll to element
     */
    smoothScrollTo(target, offset = 0) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset + offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    /**
     * Track quick action clicks
     */
    trackQuickAction(button) {
        const action = button.textContent.trim();
        const href = button.href;
        
        if (typeof adsMonetization !== 'undefined') {
            adsMonetization.trackEvent('quick_action_click', {
                action: action,
                destination: href,
                source_device: this.currentDevice
            });
        }
    }

    /**
     * Highlight relevant sections based on user actions
     */
    highlightSection(sectionId, duration = 3000) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        section.classList.add('highlighted');
        
        setTimeout(() => {
            section.classList.remove('highlighted');
        }, duration);
        
        // Scroll to section
        this.smoothScrollTo(section, -20);
    }

    /**
     * Show contextual help
     */
    showContextualHelp(topic) {
        const helpContent = this.getHelpContent(topic);
        if (!helpContent) return;
        
        const helpModal = document.createElement('div');
        helpModal.className = 'help-modal';
        helpModal.innerHTML = `
            <div class="help-modal-content">
                <div class="help-modal-header">
                    <h3>${helpContent.title}</h3>
                    <button class="help-modal-close">&times;</button>
                </div>
                <div class="help-modal-body">
                    ${helpContent.content}
                </div>
                <div class="help-modal-actions">
                    ${helpContent.actions || ''}
                </div>
            </div>
        `;
        
        // Add styles
        this.addHelpModalStyles();
        
        // Show modal
        document.body.appendChild(helpModal);
        
        // Bind close events
        const closeBtn = helpModal.querySelector('.help-modal-close');
        closeBtn.addEventListener('click', () => {
            helpModal.remove();
        });
        
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                helpModal.remove();
            }
        });
    }

    /**
     * Get help content for topic
     */
    getHelpContent(topic) {
        const helpTopics = {
            'adblock': {
                title: 'Disabilitare AdBlock',
                content: `
                    <p>Per accedere ai codici gratuiti, disabilita temporaneamente AdBlock:</p>
                    <ol>
                        <li>Clicca sull'icona AdBlock nella barra del browser</li>
                        <li>Seleziona "Pausa su questo sito"</li>
                        <li>Ricarica la pagina</li>
                    </ol>
                `
            },
            'downloader': {
                title: 'Installare Downloader',
                content: `
                    <p>L'app Downloader è necessaria per installare APK su FireStick:</p>
                    <ol>
                        <li>Vai nell'Amazon App Store</li>
                        <li>Cerca "Downloader"</li>
                        <li>Installa l'app di AFTVnews</li>
                        <li>È gratuita e sicura</li>
                    </ol>
                `
            }
        };
        
        return helpTopics[topic] || null;
    }

    /**
     * Add help modal styles
     */
    addHelpModalStyles() {
        if (document.getElementById('help-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'help-modal-styles';
        style.textContent = `
            .help-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
            }
            
            .help-modal-content {
                background: var(--card-bg);
                backdrop-filter: blur(15px);
                border-radius: var(--border-radius);
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                border: 1px solid rgba(255, 255, 255, 0.1);
                animation: slideUp 0.3s ease-out;
            }
            
            .help-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .help-modal-header h3 {
                margin: 0;
                color: var(--text-light);
            }
            
            .help-modal-close {
                background: transparent;
                border: none;
                color: var(--text-light);
                font-size: 1.5rem;
                cursor: pointer;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }
            
            .help-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .help-modal-body {
                padding: 25px;
                color: rgba(255, 255, 255, 0.9);
                line-height: 1.6;
            }
            
            .help-modal-body ol {
                padding-left: 20px;
            }
            
            .help-modal-body li {
                margin-bottom: 8px;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Get usage statistics
     */
    getStats() {
        return {
            currentDevice: this.currentDevice,
            openFAQs: this.openFAQs.size,
            totalFAQs: document.querySelectorAll('.faq-item').length
        };
    }
}

// Initialize instructions manager
let instructionsManager;
document.addEventListener('DOMContentLoaded', () => {
    instructionsManager = new InstructionsManager();
});

// Global functions for HTML interaction
function showDevice(deviceType) {
    if (instructionsManager) {
        instructionsManager.showDeviceInstructions(deviceType);
    }
}

function toggleFAQ(questionElement) {
    if (instructionsManager) {
        instructionsManager.toggleFAQ(questionElement);
    }
}

function showHelp(topic) {
    if (instructionsManager) {
        instructionsManager.showContextualHelp(topic);
    }
}

// Export for debugging
window.instructionsManager = instructionsManager;