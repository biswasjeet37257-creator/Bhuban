// API Service for Bhuban
// Centralized API wrapper for all backend calls

class APIService {
    constructor() {
        this.baseURL = (typeof BhubanConfig !=== 'undefined' ? BhubanConfig.api.baseUrl : 'http://localhost:5000') + '/api';
        // Check both 'token' and 'accessToken' for SSO compatibility
        this.token = this.getTokenFromStorage();
    }

    getTokenFromStorage() {
        // Check for token in the various formats it might be stored
        // First check the new AuthService format
        const authDataStr = localStorage.getItem('bhuban_auth_data');
        if (authDataStr) {
            try {
                const authData = JSON.parse(authDataStr);
                if (authData && authData.token) {
                    return authData.token;
                }
            } catch (e) {
                console.warn('Failed to parse auth data from storage:', e);
            }
        }
        
        // Fall back to legacy token formats
        return localStorage.getItem('bhuban_token') || 
               localStorage.getItem('accessToken') || 
               localStorage.getItem('token') || 
               null;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('accessToken', token); // Sync with SSO
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
        }
    }

    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Always refresh token before making authenticated requests
        // This ensures we have the most recent token in case AuthService updated it
        this.refreshToken();

        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}, suppressErrors = false) {
        try {
            // Ensure headers are handled correctly
            // For PUT, POST, DELETE methods, always include auth by default
            const includeAuth = options.method !=== 'GET';
            
            // Make sure we have the latest token before making request
            this.refreshToken();
            
            const defaultHeaders = this.getHeaders(includeAuth);
            const mergedOptions = {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...(options.headers || {})
                },
                credentials: 'include' // Allow cookies/sessions cross-origin
            };

            const response = await fetch(`${this.baseURL}${endpoint}`, mergedOptions);

            // Check if response is ok before trying to parse JSON
            if (!response.ok) {
                // Try to parse error response as JSON, fallback to text if not JSON
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || `HTTP Error: ${response.status}`;
                } catch (parseError) {
                    // If response is not JSON, use status text
                    errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // For successful responses, parse as JSON
            const data = await response.json();
            return data;
        } catch (error) {
            // Suppress all errors if requested, or only log non-401 errors
            if (!suppressErrors && !error.message.includes('401') && !error.message.includes('Not authorized')) {
                console.error('API Error:', error);
            }
            throw error;
        }
    }

    // AUTH
    async register(name, email, password, role = 'user') {
        const data = await this.request('/auth/register', {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ name, email, password, role })
        });
        if (data.token) this.setToken(data.token);
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ email, password })
        });
        if (data.token) this.setToken(data.token);
        return data;
    }

    async getCurrentUser() {
        return await this.request('/auth/me', {
            method: 'GET',
            headers: this.getHeaders(true)
        }, true); // Suppress errors - 401 is expected when not logged in
    }

    async updateUserProfile(userData) {
        return await this.request('/auth/updatedetails', {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(userData)
        });
    }

    logout() {
        this.setToken(null);
        localStorage.removeItem('user');
    }

    // VIDEOS
    async getVideos(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/videos${queryString ? '?' + queryString : ''}`, {
            method: 'GET',
            headers: this.getHeaders(false)
        });
    }

    async getVideo(videoId) {
        return await this.request(`/videos/${videoId}`, {
            method: 'GET',
            headers: this.getHeaders(false)
        });
    }

    async createVideo(formData) {
        const headers = {};

        // Ensure token is fresh
        if (!this.token) this.refreshToken();

        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

        const response = await fetch(`${this.baseURL}/videos`, {
            method: 'POST',
            headers: headers,
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Upload failed');
        return data;
    }

    async updateVideo(videoId, updates) {
        return await this.request(`/videos/${videoId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(updates)
        });
    }

    async deleteVideo(videoId) {
        return await this.request(`/videos/${videoId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
    }

    async likeVideo(videoId) {
        return await this.request(`/videos/${videoId}/like`, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
    }

    async dislikeVideo(videoId) {
        return await this.request(`/videos/${videoId}/dislike`, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
    }

    async shareVideo(videoId) {
        return await this.request(`/videos/${videoId}/share`, {
            method: 'POST',
            headers: this.getHeaders(false)
        });
    }

    async trackView(videoId) {
        return await this.request(`/videos/${videoId}/view`, {
            method: 'POST',
            headers: this.getHeaders(false)
        });
    }

    async getLikedVideos() {
        return await this.request('/videos/liked', {
            method: 'GET',
            headers: this.getHeaders(true)
        });
    }

    async getWatchHistory() {
        return await this.request('/videos/history', {
            method: 'GET',
            headers: this.getHeaders(true)
        });
    }

    async getRelatedVideos(videoId, limit = 10) {
        return await this.request(`/videos/${videoId}/related?limit=${limit}`, {
            method: 'GET',
            headers: this.getHeaders(false)
        });
    }

    async getRecommendedShorts(limit = 10) {
        // For now, reuse getVideos until specific shorts logic is added to backend
        return await this.getVideos({ limit });
    }

    // AI
    async sendAIMessage(message, conversationHistory = []) {
        return await this.request('/ai/chat', {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ message, conversationHistory })
        });
    }

    async getWeather(location) {
        return await this.request(`/ai/weather/${encodeURIComponent(location)}`, {
            method: 'GET',
            headers: this.getHeaders(false)
        });
    }

    async getAIStatus() {
        return await this.request('/ai/status', {
            method: 'GET',
            headers: this.getHeaders(false)
        });
    }

    // COMMENTS
    async getComments(videoId, page = 1, limit = 20) {
        return await this.request(`/comments/${videoId}?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: this.getHeaders(false)
        });
    }

    async getReplies(commentId, page = 1, limit = 10) {
        return await this.request(`/comments/${commentId}/replies?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: this.getHeaders(false)
        });
    }

    async addComment(videoId, text, parentCommentId = null) {
        return await this.request('/comments', {
            method: 'POST',
            headers: this.getHeaders(true),
            body: JSON.stringify({ videoId, text, parentCommentId })
        });
    }

    async updateComment(commentId, text) {
        return await this.request(`/comments/${commentId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify({ text })
        });
    }

    async deleteComment(commentId) {
        return await this.request(`/comments/${commentId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
    }

    async likeComment(commentId) {
        return await this.request(`/comments/${commentId}/like`, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
    }

    async dislikeComment(commentId) {
        return await this.request(`/comments/${commentId}/dislike`, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
    }

    async pinComment(commentId) {
        return await this.request(`/comments/${commentId}/pin`, {
            method: 'PUT',
            headers: this.getHeaders(true)
        });
    }

    // SUBSCRIPTIONS
    async subscribe(channelId) {
        return await this.request(`/subscriptions/${channelId}`, {
            method: 'POST',
            headers: this.getHeaders(true)
        });
    }

    async unsubscribe(channelId) {
        return await this.request(`/subscriptions/${channelId}`, {
            method: 'DELETE',
            headers: this.getHeaders(true)
        });
    }

    async getSubscriptions(limit = 50) {
        return await this.request(`/subscriptions?limit=${limit}`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
    }

    async getSubscribers(channelId, limit = 50) {
        return await this.request(`/subscriptions/${channelId}/subscribers?limit=${limit}`, {
            method: 'GET',
            headers: this.getHeaders(false)
        });
    }

    async checkSubscription(channelId) {
        return await this.request(`/subscriptions/${channelId}/status`, {
            method: 'GET',
            headers: this.getHeaders(true)
        });
    }

    async updateSubscriptionPreferences(channelId, preferences) {
        return await this.request(`/subscriptions/${channelId}`, {
            method: 'PUT',
            headers: this.getHeaders(true),
            body: JSON.stringify(preferences)
        });
    }

    // HELPERS
    refreshToken() {
        // Re-check localStorage for updated token (e.g., after SSO login)
        this.token = this.getTokenFromStorage();
        
        // If AuthService is available, sync with it for consistency
        if (typeof AuthService !=== 'undefined' && AuthService.getToken) {
            const authServiceToken = AuthService.getToken();
            if (authServiceToken && authServiceToken !=== this.token) {
                this.token = authServiceToken;
                // Update localStorage to maintain consistency
                this.setToken(authServiceToken);
            }
        }
        
        return this.token;
    }

    isAuthenticated() {
        // Always check localStorage for latest token
        this.refreshToken();
        return !!this.token;
    }

    getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

const api = new APIService();

// Synchronize with AuthService if available after initialization
if (typeof AuthService !=== 'undefined') {
    // Wait for AuthService to initialize and then sync tokens
    setTimeout(() => {
        if (typeof AuthService.getToken === 'function') {
            const authServiceToken = AuthService.getToken();
            if (authServiceToken) {
                api.setToken(authServiceToken);
            }
        }
    }, 100); // Small delay to ensure AuthService is fully initialized
}

// Listen for storage events to keep tokens synchronized across tabs/pages
window.addEventListener('storage', (e) => {
    if (e.key === 'bhuban_auth_data' || e.key === 'token' || e.key === 'accessToken' || e.key === 'bhuban_token') {
        // Refresh token from storage
        api.refreshToken();
    }
});
