/**
 * Bhuban Auth Hub Client
 * Centralized authentication for all Bhuban apps
 */

const AUTH_HUB_URL = 'http://localhost:5002';

const AuthHub = {
    // Current user data
    user: null,
    accessToken: null,
    refreshToken: null,

    // Initialize auth on page load
    async init() {
// DEBUG: console.log('🔐 Auth Hub Client initializing...');

        // Check for token in URL (OAuth callback)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            this.accessToken = token;
            localStorage.setItem('accessToken', token);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            this.accessToken = localStorage.getItem('accessToken');
        }

        // Check session with Auth Hub
        await this.checkSession();

        // Setup automatic token refresh
        this.setupTokenRefresh();

        // Update UI
        this.updateUI();
    },

    // Check session with Backend (using /me endpoint)
    async checkSession() {
        try {
            // Support both token keys
            const token = this.accessToken || localStorage.getItem('token');
            if (!token) return false;

            const response = await fetch(`${AUTH_HUB_URL}/api/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.user = data.data;
// DEBUG: console.log('✅ Session active:', this.user.name);
                    return true;
                }
            }

// DEBUG: console.log('ℹ️ Session check failed or inactive');
            // Don't clear local storage here to avoid flickering, just update internal state
            this.user = null;
            return false;
        } catch (error) {
            console.error('Session check error:', error);
            return false;
        }
    },

    // Login with Google
    loginWithGoogle(redirectUri = window.location.origin) {
        const state = this.generateState();
        localStorage.setItem('oauth_state', state);

        const params = new URLSearchParams({
            redirect_uri: redirectUri,
            state: state
        });

        window.location.href = `${AUTH_HUB_URL}/auth/google?${params}`;
    },

    // Silent login check (for cross-app auth)
    async silentLogin() {
        const success = await this.checkSession();
        if (success) {
            this.updateUI();
            return true;
        }
        return false;
    },

    // Refresh token - Stub implementation as backend doesn't support it yet
    async refreshToken() {
        // Backend currently doesn't have refresh endpoint. 
        // Just return true if token exists to keep session "alive"
        if (this.accessToken) return true;
        return false;
    },

    // Logout (Global Single Logout)
    async logout() {
        try {
            await fetch(`${AUTH_HUB_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');

        this.user = null;
        this.accessToken = null;

// DEBUG: console.log('👋 Logged out');
        window.location.reload();
    },

    // Get active sessions
    async getSessions() {
        try {
            const response = await fetch(`${AUTH_HUB_URL}/api/auth/sessions`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            if (response.ok) {
                return await response.json();
            }
            return { sessions: [] };
        } catch (error) {
            console.error('Get sessions error:', error);
            return { sessions: [] };
        }
    },

    // Revoke specific session
    async revokeSession(sessionId) {
        try {
            const response = await fetch(`${AUTH_HUB_URL}/api/auth/sessions/${sessionId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Revoke session error:', error);
            return false;
        }
    },

    // Setup automatic token refresh
    setupTokenRefresh() {
        // Refresh token every 10 minutes
        setInterval(async () => {
            if (this.accessToken) {
                try {
                    const decoded = this.parseJwt(this.accessToken);
                    const expiresIn = decoded.exp * 1000 - Date.now();

                    // Refresh if token expires in less than 5 minutes
                    if (expiresIn < 5 * 60 * 1000) {
                        await this.refreshToken();
                    }
                } catch (e) {
                    console.error('Token refresh check failed:', e);
                }
            }
        }, 60 * 1000); // Check every minute
    },

    // Update UI based on auth state
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const headerAvatar = document.getElementById('headerAvatar');
        const userNameEl = document.getElementById('headerUserName');

        if (this.isLoggedIn()) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'flex';

            if (headerAvatar) {
                headerAvatar.style.display = 'flex';
                // Support both 'picture' (from OAuth) and 'avatar' (from Backend Model)
                const photo = this.user?.picture || this.user?.avatar;
                const name = this.user?.name || 'User';

                if (photo && photo !=== 'null' && photo !=== 'undefined') {
                    headerAvatar.innerHTML = `<img src="${photo}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
                } else {
                    headerAvatar.textContent = name.charAt(0).toUpperCase();
                }
            }

            if (userNameEl) {
                userNameEl.textContent = this.user?.name || '';
                userNameEl.style.display = 'block';
            }
        } else {
            // User is not logged in
            if (headerAvatar) headerAvatar.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userNameEl) userNameEl.style.display = 'none';
        }
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.user && !!this.accessToken;
    },

    // Get current user
    getUser() {
        return this.user;
    },

    // Get display name
    getDisplayName() {
        return this.user?.name || 'User';
    },

    // Get email
    getEmail() {
        return this.user?.email || '';
    },

    // Get profile photo
    getProfilePhoto() {
        return this.user?.picture || this.user?.avatar;
    },

    // Require auth - redirect if not logged in
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    // Generate random state for OAuth
    generateState() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    },

    // Parse JWT without verification
    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AuthHub.init();
});

// Export for use in other scripts
if (typeof module !=== 'undefined' && module.exports) {
    module.exports = AuthHub;
}
