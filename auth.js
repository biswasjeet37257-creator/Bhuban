/**
 * Bhuban Authentication System
 * Shared across all Bhuban apps
 */

const Auth = {
    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },

    // Get current user data
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Get user display name
    getDisplayName() {
        return localStorage.getItem('displayName') || 'User';
    },

    // Get user email
    getEmail() {
        return localStorage.getItem('email') || '';
    },

    // Get profile photo
    getProfilePhoto() {
        const photo = localStorage.getItem('profilePhoto');
        // Handle Google profile photos that might have size parameters
        if (photo && photo.includes('googleusercontent.com')) {
            // Ensure we get a larger image by replacing size parameter
            return photo.replace(/s\d+-c/, 's400-c');
        }
        return photo;
    },

    // Get auth token
    getToken() {
        return localStorage.getItem('token');
    },

    // Login user
    login(userData, token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        if (userData.name) {
            localStorage.setItem('displayName', userData.name);
        }
        if (userData.email) {
            localStorage.setItem('email', userData.email);
        }
        // Check for profile photo in multiple possible fields
        const photoUrl = userData.picture || userData.avatar || userData.photo || userData.image;
        if (photoUrl) {
            // Handle Google profile photos with proper sizing
            let finalPhotoUrl = photoUrl;
            if (photoUrl.includes('googleusercontent.com')) {
                finalPhotoUrl = photoUrl.replace(/s\d+-c/, 's400-c');
            }
            localStorage.setItem('profilePhoto', finalPhotoUrl);
        }
        if (userData.googleId) {
            localStorage.setItem('googleId', userData.googleId);
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('displayName');
        localStorage.removeItem('email');
        localStorage.removeItem('profilePhoto');
        localStorage.removeItem('googleId');
        window.location.href = 'login.html';
    },

    // Update header UI based on auth state
    updateHeader() {
        const headerAvatar = document.getElementById('headerAvatar');
        const loginBtn = document.getElementById('loginBtn');
        const userName = document.getElementById('headerUserName');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (this.isLoggedIn()) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'flex';
            if (headerAvatar) {
                headerAvatar.style.display = 'flex';
                const photo = this.getProfilePhoto();
                const name = this.getDisplayName();
                if (photo) {
                    headerAvatar.innerHTML = `<img src="${photo}" alt="${name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
                } else {
                    headerAvatar.textContent = name.charAt(0).toUpperCase();
                }
            }
            if (userName) {
                userName.textContent = this.getDisplayName();
                userName.style.display = 'block';
            }
        } else {
            // User is not logged in
            if (headerAvatar) headerAvatar.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userName) userName.style.display = 'none';
        }
    },

    // Protect route - redirect to login if not authenticated
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Redirect if already logged in
    redirectIfLoggedIn(redirectUrl = 'index.html') {
        if (this.isLoggedIn()) {
            window.location.href = redirectUrl;
        }
    },

    // Initialize auth on page load
    init() {
// DEBUG: console.log('🔐 Auth initialized');
// DEBUG: console.log('Logged in:', this.isLoggedIn());
// DEBUG: console.log('User:', this.getDisplayName());
// DEBUG: console.log('Photo URL:', this.getProfilePhoto());
        
        this.updateHeader();
        
        // Add logout functionality to logout buttons
        document.querySelectorAll('[data-action="logout"]').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });
    }
};

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Export for use in other scripts
if (typeof module !=== 'undefined' && module.exports) {
    module.exports = Auth;
}
