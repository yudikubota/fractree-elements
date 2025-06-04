/**
 * ═══════════════════════════════════════════════════════════════
 * FRACTREE LOGO GENERATOR - MOBILE MENU HANDLER
 * Manages responsive mobile menu behavior and interactions
 * ═══════════════════════════════════════════════════════════════
 */

class MobileMenuManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.mobileMenuToggle = document.getElementById('mobileMenuToggle');
        this.mobileOverlay = document.getElementById('mobileOverlay');

        this.init();
    }

    /**
     * Initialize mobile menu event listeners and responsive behavior
     */
    init() {
        // Toggle menu when clicking the menu button
        this.mobileMenuToggle.addEventListener('click', () => this.toggleMobileMenu());

        // Close menu when clicking overlay
        this.mobileOverlay.addEventListener('click', () => this.closeMobileMenu());

        // Handle window resize events
        window.addEventListener('resize', () => this.handleResize());

        // Auto-close menu after interactions on mobile
        this.setupAutoClose();

        // Prevent zoom on input focus for iOS devices
        this.preventZoomOnFocus();
    }

    /**
     * Toggle the mobile menu open/closed state
     */
    toggleMobileMenu() {
        this.sidebar.classList.toggle('open');
        this.mobileOverlay.classList.toggle('open');
    }

    /**
     * Close the mobile menu
     */
    closeMobileMenu() {
        this.sidebar.classList.remove('open');
        this.mobileOverlay.classList.remove('open');
    }

    /**
     * Handle window resize events
     */
    handleResize() {
        // Close mobile menu when switching to desktop view
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    /**
     * Setup auto-close behavior for mobile interactions
     */
    setupAutoClose() {
        // Close menu when interacting with certain elements on mobile
        if (window.innerWidth <= 768) {
            this.sidebar.addEventListener('click', (e) => {
                // Close menu when clicking buttons or color inputs
                if (e.target.tagName === 'BUTTON' || e.target.type === 'color') {
                    setTimeout(() => this.closeMobileMenu(), 100);
                }
            });
        }
    }

    /**
     * Prevent zoom on input focus for iOS devices
     * This addresses the common iOS behavior of zooming when focusing inputs
     */
    preventZoomOnFocus() {
        const inputs = document.querySelectorAll('input[type="range"], input[type="number"], input[type="color"]');

        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                if (window.innerWidth <= 768) {
                    // Quick blur/focus trick to prevent zoom on iOS
                    e.target.blur();
                    e.target.focus();
                }
            });
        });
    }

    /**
     * Check if mobile menu is currently open
     * @returns {boolean} True if mobile menu is open
     */
    isOpen() {
        return this.sidebar.classList.contains('open');
    }
}

// Export for use in main application
window.MobileMenuManager = MobileMenuManager; 