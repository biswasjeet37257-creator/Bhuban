/**
 * Bhuban Pathway Monitoring System
 * Real-time monitoring and validation of all system pathways
 */

const PathwayMonitor = {
    // System health status
    health: {
        overall: 'healthy',
        backend: 'unknown',
        frontend: 'healthy',
        pathways: 'healthy',
        lastCheck: null
    },

    // Pathway validation results
    validations: {
        navigation: [],
        api: [],
        storage: [],
        files: []
    },

    // Statistics
    stats: {
        totalPathways: 0,
        validPathways: 0,
        invalidPathways: 0,
        warnings: 0
    },

    /**
     * Initialize monitoring system
     */
    async init() {
// DEBUG: console.log('🔍 Initializing Pathway Monitor...');
        await this.runFullDiagnostics();
        this.startHealthMonitoring();
        return this.getReport();
    },

    /**
     * Run complete diagnostics
     */
    async runFullDiagnostics() {
        this.health.lastCheck = new Date().toISOString();
        
        // Validate all pathways
        await this.validateNavigation();
        await this.validateAPI();
        await this.validateStorage();
        await this.validateFiles();
        
        // Calculate overall health
        this.calculateHealth();
        
// DEBUG: console.log('✅ Diagnostics complete');
    },

    /**
     * Validate navigation pathways
     */
    async validateNavigation() {
        const results = [];
        
        // Check all page routes
        for (const [key, path] of Object.entries(BhubanConfig.pages)) {
            const result = {
                type: 'navigation',
                name: key,
                path: path,
                status: 'unknown',
                message: ''
            };

            try {
                // For relative paths, check if they exist
                if (!path.startsWith('http')) {
                    // We can't actually check file existence from browser
                    // But we can validate the path format
                    if (path.endsWith('.html')) {
                        result.status = 'valid';
                        result.message = 'Path format valid';
                    } else {
                        result.status = 'warning';
                        result.message = 'Path does not end with .html';
                    }
                } else {
                    result.status = 'valid';
                    result.message = 'External URL';
                }
            } catch (error) {
                result.status = 'error';
                result.message = error.message;
            }

            results.push(result);
        }

        this.validations.navigation = results;
    },

    /**
     * Validate API endpoints
     */
    async validateAPI() {
        const results = [];

        // Test backend health
        try {
            const healthUrl = BhubanAPI.url(BhubanConfig.api.endpoints.health);
            const response = await fetch(healthUrl, { method: 'GET' });
            
            results.push({
                type: 'api',
                name: 'Backend Health',
                endpoint: healthUrl,
                status: response.ok ? 'valid' : 'error',
                message: response.ok ? `Backend online (${response.status})` : `Backend error (${response.status})`,
                responseTime: 0
            });

            this.health.backend = response.ok ? 'healthy' : 'error';
        } catch (error) {
            results.push({
                type: 'api',
                name: 'Backend Health',
                endpoint: BhubanAPI.url(BhubanConfig.api.endpoints.health),
                status: 'error',
                message: 'Backend offline: ' + error.message
            });
            this.health.backend = 'offline';
        }

        // Test videos endpoint
        try {
            const startTime = Date.now();
            const videos = await BhubanAPI.getVideos();
            const responseTime = Date.now() - startTime;
            
            results.push({
                type: 'api',
                name: 'Videos API',
                endpoint: BhubanAPI.url(BhubanConfig.api.endpoints.videos),
                status: 'valid',
                message: `Returned ${videos.length} videos in ${responseTime}ms`,
                responseTime: responseTime
            });
        } catch (error) {
            results.push({
                type: 'api',
                name: 'Videos API',
                endpoint: BhubanAPI.url(BhubanConfig.api.endpoints.videos),
                status: 'error',
                message: error.message
            });
        }

        this.validations.api = results;
    },

    /**
     * Validate storage pathways
     */
    async validateStorage() {
        const results = [];

        // Test each storage key
        for (const [key, storageKey] of Object.entries(BhubanConfig.storage)) {
            const result = {
                type: 'storage',
                name: key,
                key: storageKey,
                status: 'valid',
                message: ''
            };

            try {
                // Try to access localStorage
                const testValue = { test: true, timestamp: Date.now() };
                localStorage.setItem(storageKey + '_test', JSON.stringify(testValue));
                const retrieved = JSON.parse(localStorage.getItem(storageKey + '_test'));
                localStorage.removeItem(storageKey + '_test');

                if (retrieved && retrieved.test) {
                    result.status = 'valid';
                    result.message = 'Read/write successful';
                } else {
                    result.status = 'error';
                    result.message = 'Failed to retrieve test data';
                }

                // Check if actual data exists
                const actualData = localStorage.getItem(storageKey);
                if (actualData) {
                    result.message += ` (${(actualData.length / 1024).toFixed(2)}KB stored)`;
                }
            } catch (error) {
                result.status = 'error';
                result.message = error.message;
            }

            results.push(result);
        }

        this.validations.storage = results;
    },

    /**
     * Validate file pathways
     */
    async validateFiles() {
        const results = [];

        // Check if config.js is loaded
        results.push({
            type: 'file',
            name: 'config.js',
            path: 'config.js',
            status: typeof BhubanConfig !=== 'undefined' ? 'valid' : 'error',
            message: typeof BhubanConfig !=== 'undefined' ? 'Loaded successfully' : 'Not loaded'
        });

        // Check if urlHelper exists on backend
        try {
            const response = await fetch(BhubanAPI.url('/api/health'));
            results.push({
                type: 'file',
                name: 'Backend urlHelper',
                path: 'backend/utils/urlHelper.js',
                status: response.ok ? 'valid' : 'unknown',
                message: response.ok ? 'Backend operational' : 'Cannot verify'
            });
        } catch (error) {
            results.push({
                type: 'file',
                name: 'Backend urlHelper',
                path: 'backend/utils/urlHelper.js',
                status: 'unknown',
                message: 'Backend offline'
            });
        }

        this.validations.files = results;
    },

    /**
     * Calculate overall health
     */
    calculateHealth() {
        let totalValid = 0;
        let totalInvalid = 0;
        let totalWarnings = 0;
        let totalTests = 0;

        // Count all validations
        for (const category of Object.values(this.validations)) {
            for (const result of category) {
                totalTests++;
                if (result.status === 'valid') totalValid++;
                else if (result.status === 'error') totalInvalid++;
                else if (result.status === 'warning') totalWarnings++;
            }
        }

        this.stats.totalPathways = totalTests;
        this.stats.validPathways = totalValid;
        this.stats.invalidPathways = totalInvalid;
        this.stats.warnings = totalWarnings;

        // Determine overall health
        if (totalInvalid > 0) {
            this.health.overall = 'error';
            this.health.pathways = 'error';
        } else if (totalWarnings > 0) {
            this.health.overall = 'warning';
            this.health.pathways = 'warning';
        } else {
            this.health.overall = 'healthy';
            this.health.pathways = 'healthy';
        }
    },

    /**
     * Get comprehensive report
     */
    getReport() {
        return {
            health: this.health,
            validations: this.validations,
            stats: this.stats,
            config: {
                apiBaseUrl: BhubanConfig.api.baseUrl,
                totalPages: Object.keys(BhubanConfig.pages).length,
                totalEndpoints: Object.keys(BhubanConfig.api.endpoints).length,
                totalStorageKeys: Object.keys(BhubanConfig.storage).length
            },
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Get summary for display
     */
    getSummary() {
        const report = this.getReport();
        return {
            status: this.health.overall,
            message: this.getHealthMessage(),
            stats: this.stats,
            lastCheck: this.health.lastCheck
        };
    },

    /**
     * Get health message
     */
    getHealthMessage() {
        if (this.health.overall === 'healthy') {
            return '✅ All systems operational';
        } else if (this.health.overall === 'warning') {
            return `⚠️ ${this.stats.warnings} warning(s) detected`;
        } else {
            return `❌ ${this.stats.invalidPathways} error(s) detected`;
        }
    },

    /**
     * Start continuous health monitoring
     */
    startHealthMonitoring() {
        // Check health every 30 seconds
        this.healthInterval = setInterval(async () => {
            await this.runFullDiagnostics();
            this.notifyHealthChange();
        }, 30000);
    },

    /**
     * Notify of health changes
     */
    notifyHealthChange() {
        // Dispatch custom event for health updates
        window.dispatchEvent(new CustomEvent('pathwayHealthUpdate', {
            detail: this.getSummary()
        }));
    },

    /**
     * Export report as JSON
     */
    exportReport() {
        const report = this.getReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bhuban-pathway-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    /**
     * Get detailed pathway map
     */
    getPathwayMap() {
        return {
            navigation: {
                description: 'Page navigation pathways',
                helper: 'BhubanNav',
                paths: BhubanConfig.pages,
                functions: {
                    watchVideo: 'Navigate to watch page with video ID',
                    goTo: 'Navigate to any page by name',
                    getVideoId: 'Get current video ID from URL'
                }
            },
            api: {
                description: 'Backend API pathways',
                helper: 'BhubanAPI',
                baseUrl: BhubanConfig.api.baseUrl,
                endpoints: BhubanConfig.api.endpoints,
                functions: {
                    getVideos: 'Fetch all videos',
                    getVideo: 'Fetch single video by ID',
                    uploadVideo: 'Upload new video',
                    url: 'Get full API URL for endpoint'
                }
            },
            storage: {
                description: 'LocalStorage pathways',
                helper: 'BhubanStorage',
                keys: BhubanConfig.storage,
                functions: {
                    saveVideos: 'Save videos array',
                    getVideos: 'Get videos array',
                    saveCurrentVideo: 'Save current video object',
                    getCurrentVideo: 'Get current video object'
                }
            },
            validation: {
                description: 'Validation pathways',
                helper: 'BhubanValidate',
                functions: {
                    videoFile: 'Validate video file (size, type)',
                    videoId: 'Validate video ID format'
                }
            },
            uploadFlow: {
                description: 'Video upload to display pathway',
                steps: [
                    '1. User uploads video via upload.html',
                    '2. Video sent to backend /api/videos endpoint',
                    '3. Backend saves video to database',
                    '4. Upload.html clears bhuban_videos cache',
                    '5. Upload.html sets videoUploaded localStorage flag',
                    '6. Upload.html redirects to index.html?uploaded=true',
                    '7. Index.html detects upload flag and forces refresh',
                    '8. Index.html fetches fresh data from API',
                    '9. New video appears in feed'
                ],
                troubleshooting: {
                    'Video not appearing': [
                        'Check if backend is running (port 5000)',
                        'Check if video was saved to database',
                        'Check if bhuban_videos cache was cleared',
                        'Check if videoUploaded flag was set',
                        'Check browser console for errors',
                        'Try manual refresh (Ctrl+F5)'
                    ],
                    'Cache issues': [
                        'Clear localStorage: localStorage.clear()',
                        'Clear specific cache: localStorage.removeItem("bhuban_videos")',
                        'Force refresh on load with ?uploaded=true parameter'
                    ]
                }
            }
        };
    },
    
    /**
     * Test upload pathway
     */
    async testUploadPathway() {
// DEBUG: console.log('🧪 Testing upload pathway...');
        const results = [];
        
        // Test 1: Check if backend is accessible
        try {
            const response = await fetch(BhubanAPI.url('/api/videos'));
            results.push({
                test: 'Backend API accessible',
                status: response.ok ? 'pass' : 'fail',
                message: response.ok ? 'Backend responding' : `Backend error: ${response.status}`
            });
        } catch (error) {
            results.push({
                test: 'Backend API accessible',
                status: 'fail',
                message: 'Backend offline: ' + error.message
            });
        }
        
        // Test 2: Check localStorage write permissions
        try {
            localStorage.setItem('pathway_test', 'test');
            localStorage.removeItem('pathway_test');
            results.push({
                test: 'LocalStorage writable',
                status: 'pass',
                message: 'Can write to localStorage'
            });
        } catch (error) {
            results.push({
                test: 'LocalStorage writable',
                status: 'fail',
                message: 'Cannot write to localStorage: ' + error.message
            });
        }
        
        // Test 3: Check if video cache exists
        const cacheExists = localStorage.getItem('bhuban_videos') !=== null;
        results.push({
            test: 'Video cache status',
            status: 'info',
            message: cacheExists ? 'Cache exists (may need clearing after upload)' : 'No cache (will fetch fresh data)'
        });
        
        // Test 4: Check for recent upload flag
        const uploadFlag = localStorage.getItem('videoUploaded');
        results.push({
            test: 'Upload flag status',
            status: 'info',
            message: uploadFlag ? `Upload detected at ${new Date(parseInt(uploadFlag)).toLocaleString()}` : 'No recent uploads'
        });
        
// DEBUG: console.log('🧪 Upload pathway test results:', results);
        return results;
    },
    
    /**
     * Cleanup intervals and listeners to prevent memory leaks
     */
    destroy() {
        if (this.healthInterval) {
            clearInterval(this.healthInterval);
        }
        // Clear any stored data
        this.validations = { navigation: [], api: [], storage: [], files: [] };
        this.stats = { totalPathways: 0, validPathways: 0, invalidPathways: 0, warnings: 0 };
    }
};

// Make available globally
if (typeof window !=== 'undefined') {
    window.PathwayMonitor = PathwayMonitor;
}

// Export for Node.js
if (typeof module !=== 'undefined' && module.exports) {
    module.exports = PathwayMonitor;
}
