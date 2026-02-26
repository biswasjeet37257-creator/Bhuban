/**
 * Bhuban App Configuration
 * Centralized configuration for all app paths and URLs
 * This is the SINGLE SOURCE OF TRUTH for all navigation and API endpoints
 */

const BhubanConfig = {
    // API Configuration
    api: {
        baseUrl: 'https://shree-ai.vercel.app',
        endpoints: {
            videos: '/api/videos',
            video: (id) => `/api/videos/${id}`,
            upload: '/api/videos',
            comments: (videoId) => `/api/comments/${videoId}`,
            auth: '/api/auth',
            analytics: '/api/analytics',
            health: '/api/health'
        }
    },

    // Page Routes - All navigation paths in one place
    pages: {
        home: '/index.html',
        watch: '/watch.html',
        upload: '/upload.html',
        creator: '/creator-studio/index.html',
        developer: '/developer-dashboard/index.html',
        trending: 'trending.html',
        subscriptions: 'subscriptions.html',
        history: 'history.html',
        likedVideos: 'liked-videos.html',
        gaming: 'gaming.html',
        music: 'music.html',
        shorts: 'shorts.html',
        login: 'login.html',
        account: 'account.html'
    },

    // Video Player Configuration
    video: {
        defaultThumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=640',
        supportedFormats: ['mp4', 'webm', 'mov', 'avi', 'mkv'],
        maxUploadSize: 5 * 1024 * 1024 * 1024, // 5GB
        preload: 'metadata'
    },

    // Storage Keys
    storage: {
        videos: 'bhuban_videos',
        currentVideo: 'currentVideo',
        user: 'bhuban_user',
        token: 'token',
        systemState: 'bhuban_system_state',
        creatorVideos: 'creator_videos',
        creatorStats: 'creator_stats',
        health: 'bhuban_creator_health'
    }
};

/**
 * Navigation Helper Functions
 */
const BhubanNav = {
    /**
     * Navigate to watch page with video ID
     * @param {string} videoId - The video ID to watch
     */
    watchVideo: function (videoId) {
        if (!videoId) {
            console.error('Video ID is required');
            return;
        }
        window.location.href = `${BhubanConfig.pages.watch}?v=${videoId}`;
    },

    /**
     * Navigate to any page
     * @param {string} pageName - Key from BhubanConfig.pages
     */
    goTo: function (pageName) {
        const page = BhubanConfig.pages[pageName];
        if (!page) {
            console.error(`Page "${pageName}" not found in config`);
            return;
        }
        window.location.href = page;
    },

    /**
     * Get current video ID from URL
     * @returns {string|null} Video ID or null
     */
    getVideoId: function () {
        const params = new URLSearchParams(window.location.search);
        return params.get('v');
    }
};

/**
 * API Helper Functions
 */
const BhubanAPI = {
    /**
     * Get full API URL
     * @param {string} endpoint - Endpoint path
     * @returns {string} Full URL
     */
    url: function (endpoint) {
        return `${BhubanConfig.api.baseUrl}${endpoint}`;
    },

    /**
     * Fetch all videos
     * @returns {Promise<Array>} Array of videos
     */
    getVideos: async function () {
        try {
            const url = this.url(BhubanConfig.api.endpoints.videos);
// DEBUG: console.log('📹 API getVideos - Fetching from:', url);
            
            const response = await fetch(url);
// DEBUG: console.log('📹 API getVideos - Response status:', response.status);
            
            if (!response.ok) {
                console.error('❌ API getVideos - HTTP error:', response.status, response.statusText);
                return [];
            }
            
            const data = await response.json();
// DEBUG: console.log('📹 API getVideos response:', data);
            
            if (data.success && data.data) {
// DEBUG: console.log(`✅ API getVideos - Loaded ${data.data.length} videos`);
                return data.data;
            } else {
                console.warn('⚠️ API getVideos - No data in response');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to fetch videos:', error);
            return [];
        }
    },

    /**
     * Fetch single video
     * @param {string} id - Video ID
     * @returns {Promise<Object|null>} Video object or null
     */
    getVideo: async function (id) {
        try {
            const response = await fetch(this.url(BhubanConfig.api.endpoints.video(id)));
            const data = await response.json();
            return data.success ? data.data : null;
        } catch (error) {
            console.error('Failed to fetch video:', error);
            return null;
        }
    },

    /**
     * Upload video
     * @param {FormData} formData - Form data with video file
     * @returns {Promise<Object>} Upload result
     */
    uploadVideo: async function (formData) {
        try {
            const response = await fetch(this.url(BhubanConfig.api.endpoints.upload), {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to upload video:', error);
            throw error;
        }
    }
};

/**
 * Storage Helper Functions
 */
const BhubanStorage = {
    /**
     * Save video data for watch page
     * @param {Object} video - Video object
     */
    saveCurrentVideo: function (video) {
        localStorage.setItem(BhubanConfig.storage.currentVideo, JSON.stringify(video));
    },

    /**
     * Get current video data
     * @returns {Object|null} Video object or null
     */
    getCurrentVideo: function () {
        const data = localStorage.getItem(BhubanConfig.storage.currentVideo);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Save videos list
     * @param {Array} videos - Array of videos
     */
    saveVideos: function (videos) {
        localStorage.setItem(BhubanConfig.storage.videos, JSON.stringify(videos));
    },

    /**
     * Get videos list
     * @returns {Array} Array of videos
     */
    getVideos: function () {
        const data = localStorage.getItem(BhubanConfig.storage.videos);
        return data ? JSON.parse(data) : [];
    }
};

/**
 * Validation Functions
 */
const BhubanValidate = {
    /**
     * Validate video file
     * @param {File} file - File object
     * @returns {Object} {valid: boolean, error: string}
     */
    videoFile: function (file) {
        if (!file) {
            return { valid: false, error: 'No file selected' };
        }

        if (!file.type.startsWith('video/')) {
            return { valid: false, error: 'Please select a video file' };
        }

        if (file.size > BhubanConfig.video.maxUploadSize) {
            const maxMB = BhubanConfig.video.maxUploadSize / (1024 * 1024);
            return { valid: false, error: `File must be less than ${maxMB}MB` };
        }

        return { valid: true };
    },

    /**
     * Validate video ID
     * @param {string} id - Video ID
     * @returns {boolean} Valid or not
     */
    videoId: function (id) {
        return id && typeof id === 'string' && id.length > 0;
    }
};

// Make available globally
if (typeof window !=== 'undefined') {
    window.BhubanConfig = BhubanConfig;
    window.BhubanNav = BhubanNav;
    window.BhubanAPI = BhubanAPI;
    window.BhubanStorage = BhubanStorage;
    window.BhubanValidate = BhubanValidate;
}

// Export for Node.js (if needed)
if (typeof module !=== 'undefined' && module.exports) {
    module.exports = {
        BhubanConfig,
        BhubanNav,
        BhubanAPI,
        BhubanStorage,
        BhubanValidate
    };
}
