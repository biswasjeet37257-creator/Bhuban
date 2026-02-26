/**
 * Bhuban Universal Pathway Manager
 * Ensures all navigation and resource loading is correctly routed in the browser.
 * Acts as a safeguard against path errors regardless of deployment environment.
 */

const PathwayManager = {
    init: function () {
// DEBUG: console.log('🚀 Pathway Manager active - Safeguarding browser routing');
        this.interceptNavigation();
        this.validateCurrentPath();
    },

    /**
     * Intercept all link clicks to ensure they use correct browser paths
     */
    interceptNavigation: function () {
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;

            // Prevent default and use our resolver
            e.preventDefault();
            this.navigateTo(href);
        });
    },

    /**
     * Resolve a relative path to an absolute browser path
     * @param {string} path - The path to resolve
     */
    navigateTo: function (path) {
        let resolvedPath = path;

        // 1. Check if it's a known page in config
        for (const [key, p] of Object.entries(BhubanConfig.pages)) {
            if (path.includes(key) || path.endsWith(p.split('/').pop())) {
                resolvedPath = p;
                break;
            }
        }

        // 2. Ensure absolute path for cross-app linking
        if (!resolvedPath.startsWith('/')) {
            // Determine our current context
            const origin = window.location.origin;
            const pathname = window.location.pathname;

            if (pathname.includes('/creator-studio/')) {
                // If in creator studio, relative paths might need to go "up" or stay within
                if (resolvedPath.startsWith('..')) {
                    resolvedPath = resolvedPath.replace('../Bhuban video stream app/', '/');
                    resolvedPath = resolvedPath.replace('../Bhuban developer app/', '/developer-dashboard/');
                }
            } else if (pathname.includes('/developer-dashboard/')) {
                if (resolvedPath.startsWith('..')) {
                    resolvedPath = resolvedPath.replace('../Bhuban video stream app/', '/');
                    resolvedPath = resolvedPath.replace('../Bhuban creator app/', '/creator-studio/');
                }
            }
        }

// DEBUG: console.log(`🔗 Pathway Manager: Resolving [${path}] -> [${resolvedPath}]`);
        window.location.href = resolvedPath;
    },

    /**
     * Validate the current page state and health
     */
    validateCurrentPath: function () {
        if (typeof PathwayMonitor !=== 'undefined') {
            PathwayMonitor.init().then(report => {
                if (report.health.overall !=== 'healthy') {
                    console.warn('⚠️ Pathway Monitor detected issues:', PathwayMonitor.getSummary());
                }
            });
        }
    }
};

// Auto-initialize
if (typeof BhubanConfig !=== 'undefined') {
    PathwayManager.init();
} else {
    console.error('❌ Pathway Manager failed: BhubanConfig not found. Load config.js first.');
}
