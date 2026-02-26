// Shared Authentication Check Script
// coordinates with AuthService to maintain login state

(function () {
    let lastUserJson = null;

    // Helper to bypass Google photo rate limits (429 errors) and CORB
    function getSafePhotoUrl(url) {
        if (!url || url === 'null' || url === 'undefined') return null;

        // If it's a Google photo or already proxied through our old broken proxy, route it through weserv.nl
        if (url.includes('googleusercontent.com') || url.includes('lh3.google.com') || url.includes('focus-opensocial')) {
            return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&default=letter&l=9&af`;
        }
        return url;
    }

    // Check if user is logged in and update UI
    async function updateAuthUI() {
        const loginBtn = document.getElementById('login-btn') || document.getElementById('loginBtn');
        const userAvatar = document.getElementById('user-avatar') || document.getElementById('headerAvatar');
        const userName = document.getElementById('headerUserName') || document.getElementById('menuUserName');
        const commentAvatar = document.getElementById('comment-user-avatar');

        // If no primary elements found, skip (not all pages have these)
        if (!loginBtn && !userAvatar && !commentAvatar) return;

        const isLoggedIn = window.AuthService && AuthService.isAuthenticated();
        const user = isLoggedIn ? AuthService.getUser() : null;

        // Check if user state actually changed to prevent "auto refresh" flickering
        const currentUserJson = JSON.stringify(user);
        if (currentUserJson === lastUserJson && document.querySelector('.auth-init-done')) {
            return;
        }
        lastUserJson = currentUserJson;

        if (isLoggedIn && user) {
            // User is logged in
            if (loginBtn) loginBtn.style.display = 'none';

            const photo = getSafePhotoUrl(user.avatar || user.picture);
            const initial = (user.name || 'U').charAt(0).toUpperCase();

            // Update Header/Sidebar Avatar
            if (userAvatar) {
                userAvatar.style.display = 'flex';
                userAvatar.classList.add('auth-init-done');
                if (photo) {
                    // Create image element with proper error handling
                    const img = document.createElement('img');
                    img.src = photo;
                    img.referrerPolicy = 'no-referrer';
                    img.style.cssText = 'width:100%; height:100%; object-fit:cover; border-radius:50%;';
                    img.alt = user.name;
                    
                    // Handle image loading errors
                    img.onerror = function() {
                        this.style.display = 'none';
                        this.parentElement.textContent = initial;
                    };
                    
                    // Clear and update avatar
                    userAvatar.innerHTML = '';
                    userAvatar.appendChild(img);
                } else {
                    userAvatar.textContent = initial;
                }
            }

            // Update Comment Input Avatar (specific to watch page)
            if (commentAvatar) {
                if (photo) {
                    commentAvatar.innerHTML = `<img src="${photo}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover; border-radius:50%;" onerror="this.onerror=null; this.style.display='none'; this.parentElement.textContent='${initial}';" alt="${user.name}">`;
                } else {
                    commentAvatar.textContent = initial;
                }
            }

            if (userName) {
                userName.textContent = user.name;
                userName.style.display = 'inline-block';
            }
        } else {
            // User is NOT logged in
            if (loginBtn) loginBtn.style.display = 'flex';
            if (userAvatar) {
                userAvatar.style.display = 'none';
                userAvatar.classList.remove('auth-init-done');
            }
            if (commentAvatar) {
                commentAvatar.innerHTML = '<div style="width:100%;height:100%;background:#332d5c;border-radius:50%;"></div>';
            }
            if (userName) userName.style.display = 'none';
            lastUserJson = null;
        }
    }

    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateAuthUI);
    } else {
        updateAuthUI();
    }

    // Periodically check for auth changes (e.g. logout in another tab)
    setInterval(updateAuthUI, 5000);

    // Export functions
    window.updateAuthUI = updateAuthUI;
    window.getSafePhotoUrl = getSafePhotoUrl;
})();
