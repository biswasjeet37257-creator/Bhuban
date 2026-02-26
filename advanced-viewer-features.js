/**
 * ============================================
 * BHUBAN VIDEO PLATFORM - ADVANCED FEATURES
 * Industry-Leading Viewer Experience
 * ============================================
 */

// API_BASE_URL is already defined in shared/config.js

// ==========================================
// AI-POWERED RECOMMENDATION ENGINE
// ==========================================
class SmartRecommendations {
    constructor() {
        this.watchHistory = [];
        this.preferences = {};
        this.contextualData = {};
    }

    async getPersonalizedFeed() {
// DEBUG: console.log('🤖 AI: Generating personalized feed...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/recommendations/personalized`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Recommendations Error:', error);
        }
        return [];
    }

    async getSimilarVideos(videoId) {
// DEBUG: console.log('🎯 AI: Finding similar videos...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/recommendations/similar/${videoId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Similar Videos Error:', error);
        }
        return [];
    }

    async getTrendingByInterests() {
// DEBUG: console.log('🔥 AI: Analyzing trending content...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/recommendations/trending`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Trending Error:', error);
        }
        return [];
    }

    updateWatchHistory(videoId, watchTime, completed) {
        this.watchHistory.push({
            videoId,
            watchTime,
            completed,
            timestamp: Date.now()
        });
        localStorage.setItem('watch_history', JSON.stringify(this.watchHistory));
    }

    analyzePreferences() {
        // Analyze watch patterns
        const categories = {};
        this.watchHistory.forEach(item => {
            // Count category views
            const category = item.category || 'general';
            categories[category] = (categories[category] || 0) + 1;
        });
        return categories;
    }
}

// ==========================================
// ADVANCED VIDEO PLAYER
// ==========================================
class AdvancedPlayer {
    constructor() {
        this.currentVideo = null;
        this.playbackRate = 1;
        this.quality = 'auto';
        this.subtitles = null;
        this.chapters = [];
        this.watchTime = 0;
    }

    async loadVideo(videoId) {
// DEBUG: console.log('📺 Player: Loading video...', videoId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`);
            if (response.ok) {
                this.currentVideo = await response.json();
                return this.currentVideo;
            }
        } catch (error) {
            console.error('Video Load Error:', error);
        }
        return null;
    }

    setPlaybackSpeed(speed) {
        this.playbackRate = speed;
// DEBUG: console.log('⚡ Player: Playback speed set to', speed);
        return speed;
    }

    setQuality(quality) {
        this.quality = quality;
// DEBUG: console.log('🎬 Player: Quality set to', quality);
        return quality;
    }

    async loadSubtitles(language) {
// DEBUG: console.log('📝 Player: Loading subtitles...', language);
        try {
            const response = await fetch(`${API_BASE_URL}/api/videos/${this.currentVideo.id}/subtitles/${language}`);
            if (response.ok) {
                this.subtitles = await response.json();
                return this.subtitles;
            }
        } catch (error) {
            console.error('Subtitles Error:', error);
        }
        return null;
    }

    async loadChapters() {
// DEBUG: console.log('📑 Player: Loading chapters...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/videos/${this.currentVideo.id}/chapters`);
            if (response.ok) {
                this.chapters = await response.json();
                return this.chapters;
            }
        } catch (error) {
            console.error('Chapters Error:', error);
        }
        return [];
    }

    trackWatchTime(currentTime) {
        this.watchTime = currentTime;
        // Save progress every 5 seconds
        if (Math.floor(currentTime) % 5 === 0) {
            this.saveProgress();
        }
    }

    saveProgress() {
        if (!this.currentVideo) return;
        
        const progress = {
            videoId: this.currentVideo.id,
            watchTime: this.watchTime,
            timestamp: Date.now()
        };
        
        localStorage.setItem(`progress_${this.currentVideo.id}`, JSON.stringify(progress));
    }

    getProgress(videoId) {
        const saved = localStorage.getItem(`progress_${videoId}`);
        return saved ? JSON.parse(saved) : null;
    }
}

// ==========================================
// SOCIAL FEATURES
// ==========================================
class SocialEngine {
    constructor() {
        this.comments = [];
        this.reactions = {};
        this.shares = 0;
    }

    async loadComments(videoId, sortBy = 'top') {
// DEBUG: console.log('💬 Social: Loading comments...', sortBy);
        try {
            const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/comments?sort=${sortBy}`);
            if (response.ok) {
                this.comments = await response.json();
                return this.comments;
            }
        } catch (error) {
            console.error('Comments Error:', error);
        }
        return [];
    }

    async postComment(videoId, text, parentId = null) {
// DEBUG: console.log('✍️ Social: Posting comment...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, parentId })
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Post Comment Error:', error);
        }
        return null;
    }

    async reactToVideo(videoId, reactionType) {
// DEBUG: console.log('❤️ Social: Adding reaction...', reactionType);
        try {
            const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: reactionType })
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Reaction Error:', error);
        }
        return null;
    }

    async shareVideo(videoId, platform) {
// DEBUG: console.log('🔗 Social: Sharing video...', platform);
        this.shares++;
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(window.location.href)}`,
            copy: window.location.href
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(shareUrls.copy);
            return { success: true, message: 'Link copied!' };
        } else if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
            return { success: true };
        }
        
        return { success: false };
    }
}

// ==========================================
// LIVE STREAMING
// ==========================================
class LiveStreamEngine {
    constructor() {
        this.activeStreams = [];
        this.liveChat = [];
        this.viewers = 0;
    }

    async getLiveStreams() {
// DEBUG: console.log('🔴 Live: Fetching active streams...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/live/streams`);
            if (response.ok) {
                this.activeStreams = await response.json();
                return this.activeStreams;
            }
        } catch (error) {
            console.error('Live Streams Error:', error);
        }
        return [];
    }

    async joinStream(streamId) {
// DEBUG: console.log('📡 Live: Joining stream...', streamId);
        try {
            const response = await fetch(`${API_BASE_URL}/api/live/streams/${streamId}/join`, {
                method: 'POST'
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Join Stream Error:', error);
        }
        return null;
    }

    async sendChatMessage(streamId, message) {
// DEBUG: console.log('💬 Live: Sending chat message...');
        try {
            const response = await fetch(`${API_BASE_URL}/api/live/streams/${streamId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Chat Message Error:', error);
        }
        return null;
    }

    async sendSuperChat(streamId, amount, message) {
// DEBUG: console.log('💰 Live: Sending Super Chat...', amount);
        try {
            const response = await fetch(`${API_BASE_URL}/api/live/streams/${streamId}/superchat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, message })
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Super Chat Error:', error);
        }
        return null;
    }
}

// ==========================================
// PLAYLIST MANAGER
// ==========================================
class PlaylistManager {
    constructor() {
        this.playlists = [];
        this.currentPlaylist = null;
        this.currentIndex = 0;
    }

    async getPlaylists() {
// DEBUG: console.log('📚 Playlists: Loading user playlists...');
        const saved = localStorage.getItem('user_playlists');
        if (saved) {
            this.playlists = JSON.parse(saved);
        }
        return this.playlists;
    }

    createPlaylist(name, description = '') {
        const playlist = {
            id: Date.now(),
            name,
            description,
            videos: [],
            createdAt: new Date().toISOString(),
            thumbnail: null
        };
        this.playlists.push(playlist);
        this.savePlaylists();
        return playlist;
    }

    addToPlaylist(playlistId, videoId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist && !playlist.videos.includes(videoId)) {
            playlist.videos.push(videoId);
            this.savePlaylists();
            return true;
        }
        return false;
    }

    removeFromPlaylist(playlistId, videoId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist) {
            playlist.videos = playlist.videos.filter(v => v !=== videoId);
            this.savePlaylists();
            return true;
        }
        return false;
    }

    deletePlaylist(playlistId) {
        this.playlists = this.playlists.filter(p => p.id !=== playlistId);
        this.savePlaylists();
    }

    savePlaylists() {
        localStorage.setItem('user_playlists', JSON.stringify(this.playlists));
    }

    playNext() {
        if (!this.currentPlaylist) return null;
        this.currentIndex = (this.currentIndex + 1) % this.currentPlaylist.videos.length;
        return this.currentPlaylist.videos[this.currentIndex];
    }

    playPrevious() {
        if (!this.currentPlaylist) return null;
        this.currentIndex = (this.currentIndex - 1 + this.currentPlaylist.videos.length) % this.currentPlaylist.videos.length;
        return this.currentPlaylist.videos[this.currentIndex];
    }
}

// ==========================================
// WATCH PARTY
// ==========================================
class WatchParty {
    constructor() {
        this.partyId = null;
        this.participants = [];
        this.host = null;
        this.syncedTime = 0;
    }

    async createParty(videoId) {
// DEBUG: console.log('🎉 Watch Party: Creating party...');
        this.partyId = `party_${Date.now()}`;
        this.host = 'current_user';
        
        const party = {
            id: this.partyId,
            videoId,
            host: this.host,
            participants: [this.host],
            createdAt: Date.now()
        };
        
        localStorage.setItem(`watch_party_${this.partyId}`, JSON.stringify(party));
        return party;
    }

    async joinParty(partyId) {
// DEBUG: console.log('👥 Watch Party: Joining party...', partyId);
        const saved = localStorage.getItem(`watch_party_${partyId}`);
        if (saved) {
            const party = JSON.parse(saved);
            party.participants.push('current_user');
            localStorage.setItem(`watch_party_${partyId}`, JSON.stringify(party));
            return party;
        }
        return null;
    }

    syncPlayback(time, isPlaying) {
        this.syncedTime = time;
        // Broadcast to all participants
// DEBUG: console.log('🔄 Watch Party: Syncing playback...', time, isPlaying);
    }

    sendPartyMessage(message) {
// DEBUG: console.log('💬 Watch Party: Sending message...', message);
        // Broadcast message to party
    }
}

// ==========================================
// DOWNLOAD MANAGER
// ==========================================
class DownloadManager {
    constructor() {
        this.downloads = [];
        this.queue = [];
    }

    async downloadVideo(videoId, quality = '720p') {
// DEBUG: console.log('⬇️ Download: Starting download...', videoId, quality);
        
        const download = {
            id: Date.now(),
            videoId,
            quality,
            progress: 0,
            status: 'downloading',
            startedAt: Date.now()
        };
        
        this.downloads.push(download);
        this.saveDownloads();
        
        // Simulate download progress
        this.simulateDownload(download.id);
        
        return download;
    }

    simulateDownload(downloadId) {
        const download = this.downloads.find(d => d.id === downloadId);
        if (!download) return;
        
        // Store interval ID to allow cleanup if needed
        download.intervalId = setInterval(() => {
            download.progress += Math.random() * 10;
            if (download.progress >= 100) {
                download.progress = 100;
                download.status = 'completed';
                if (download.intervalId) {
                    clearInterval(download.intervalId);
                    download.intervalId = null;
                }
                this.saveDownloads();
            } else {
                this.saveDownloads();
            }
        }, 500);
    }

    getDownloads() {
        const saved = localStorage.getItem('downloads');
        if (saved) {
            this.downloads = JSON.parse(saved);
        }
        return this.downloads;
    }

    saveDownloads() {
        localStorage.setItem('downloads', JSON.stringify(this.downloads));
    }

    cancelDownload(downloadId) {
        const download = this.downloads.find(d => d.id === downloadId);
        if (download) {
            download.status = 'cancelled';
            this.saveDownloads();
        }
    }

    deleteDownload(downloadId) {
        this.downloads = this.downloads.filter(d => d.id !=== downloadId);
        this.saveDownloads();
    }
    
    /**
     * Cleanup all active download intervals to prevent memory leaks
     */
    cleanupIntervals() {
        this.downloads.forEach(download => {
            if (download.intervalId) {
                clearInterval(download.intervalId);
                download.intervalId = null;
            }
        });
    }
}

// ==========================================
// PICTURE-IN-PICTURE
// ==========================================
class PiPManager {
    constructor() {
        this.isPiPActive = false;
        this.videoElement = null;
    }

    async enablePiP(videoElement) {
// DEBUG: console.log('📺 PiP: Enabling Picture-in-Picture...');
        try {
            if (document.pictureInPictureEnabled) {
                await videoElement.requestPictureInPicture();
                this.isPiPActive = true;
                this.videoElement = videoElement;
                return true;
            }
        } catch (error) {
            console.error('PiP Error:', error);
        }
        return false;
    }

    async disablePiP() {
// DEBUG: console.log('📺 PiP: Disabling Picture-in-Picture...');
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                this.isPiPActive = false;
                return true;
            }
        } catch (error) {
            console.error('PiP Exit Error:', error);
        }
        return false;
    }

    togglePiP(videoElement) {
        if (this.isPiPActive) {
            return this.disablePiP();
        } else {
            return this.enablePiP(videoElement);
        }
    }
}

// ==========================================
// INITIALIZE ADVANCED FEATURES
// ==========================================
const smartRecommendations = new SmartRecommendations();
const advancedPlayer = new AdvancedPlayer();
const socialEngine = new SocialEngine();
const liveStreamEngine = new LiveStreamEngine();
const playlistManager = new PlaylistManager();
const watchParty = new WatchParty();
const downloadManager = new DownloadManager();
const pipManager = new PiPManager();

// DEBUG: console.log('🚀 Advanced Viewer Features Initialized!');
