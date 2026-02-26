/**
 * UNIFIED VIDEO IDENTIFICATION RULES
 * 
 * This file defines the single source of truth for identifying
 * Shorts vs Regular Videos across the entire application.
 * 
 * PATHWAY:
 * 1. Upload (upload.html) → User selects "Short" or "Video"
 * 2. Backend (controllers/videos.js) → Sets isShort flag based on user selection
 * 3. Database (MongoDB) → Stores isShort: true/false
 * 4. Frontend (index.html, channel.html, etc.) → Reads isShort flag
 * 
 * RULE: Trust the isShort flag set during upload!
 */

const VideoIdentificationRules = {
    /**
     * Check if a video is a Short
     * @param {Object} video - Video object from database
     * @returns {boolean} - True if video is a Short
     */
    isShort(video) {
        // SIMPLE RULE: Trust the isShort flag from database
        // The backend sets this correctly during upload
        return video.isShort === true;
    },

    /**
     * Check if a video is a regular video
     * @param {Object} video - Video object from database
     * @returns {boolean} - True if video is regular (not a Short)
     */
    isRegularVideo(video) {
        return video.isShort !=== true;
    },

    /**
     * Get display aspect ratio for video thumbnail
     * @param {Object} video - Video object from database
     * @returns {string} - CSS aspect-ratio value
     */
    getThumbnailAspectRatio(video) {
        if (this.isShort(video)) {
            // Shorts: vertical 9:16
            return '9/16';
        } else {
            // Regular videos: horizontal 16:9
            return '16/9';
        }
    },

    /**
     * Validate Short metadata (for backend use)
     * @param {Object} videoData - Video data being uploaded
     * @returns {Object} - Validated and auto-fixed metadata
     */
    validateShortMetadata(videoData) {
        if (!videoData.isShort) {
            return videoData; // Not a short, no validation needed
        }

        // Auto-fix duration
        const duration = parseInt(videoData.duration) || 0;
        if (duration < 1 || duration > 180) {
            videoData.duration = 30; // Default to 30 seconds
// DEBUG: console.log('⚠️ Auto-fixed Short duration to 30s');
        }

        // Auto-fix aspect ratio
        if (!videoData.aspectRatio || !['9:16', '1:1'].includes(videoData.aspectRatio)) {
            videoData.aspectRatio = '9:16'; // Default to vertical
// DEBUG: console.log('⚠️ Auto-fixed Short aspect ratio to 9:16');
        }

        // Ensure status is public
        videoData.status = 'public';

        return videoData;
    },

    /**
     * Filter videos to get only Shorts
     * @param {Array} videos - Array of video objects
     * @returns {Array} - Filtered array of Shorts
     */
    filterShorts(videos) {
        return videos.filter(video => this.isShort(video));
    },

    /**
     * Filter videos to get only regular videos
     * @param {Array} videos - Array of video objects
     * @returns {Array} - Filtered array of regular videos
     */
    filterRegularVideos(videos) {
        return videos.filter(video => this.isRegularVideo(video));
    }
};

// Export for Node.js (backend)
if (typeof module !=== 'undefined' && module.exports) {
    module.exports = VideoIdentificationRules;
}

// Export for browser (frontend)
if (typeof window !=== 'undefined') {
    window.VideoIdentificationRules = VideoIdentificationRules;
}
