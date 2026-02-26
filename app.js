// BHUBAN CORE ENGINE (V10.2 - THE FINAL FIX)
lucide.createIcons();

const MockDatabase = {
    getUsers: () => JSON.parse(localStorage.getItem('bhuban_db_users')) || [],
    saveUser: (user) => {
        const users = MockDatabase.getUsers();
        users.push(user);
        localStorage.setItem('bhuban_db_users', JSON.stringify(users));
    },
    findUser: (username) => MockDatabase.getUsers().find(u => u.username === username),
    getUploadedVideos: () => JSON.parse(localStorage.getItem('bhuban_uploads')) || [],
    saveUploadedVideo: (video) => {
        const uploads = MockDatabase.getUploadedVideos();
        uploads.unshift(video);
        localStorage.setItem('bhuban_uploads', JSON.stringify(uploads));
    }
};

const SessionService = {
    current: () => JSON.parse(localStorage.getItem('bhuban_session')),
    create: (user) => {
        localStorage.setItem('bhuban_session', JSON.stringify(user));
        localStorage.setItem('bhuban_loggedIn', 'true');
    },
    destroy: () => {
        localStorage.removeItem('bhuban_session');
        localStorage.setItem('bhuban_loggedIn', 'false');
    },
    updateUser: (updatedUser) => {
        localStorage.setItem('bhuban_session', JSON.stringify(updatedUser));
        const users = MockDatabase.getUsers();
        const idx = users.findIndex(u => u.username === updatedUser.username);
        if (idx > -1) {
            users[idx] = updatedUser;
            localStorage.setItem('bhuban_db_users', JSON.stringify(users));
        }
    }
};

const state = {
    user: SessionService.current() || { username: "Guest", subscriptions: [], likes: [], age: 0 },
    view: 'home',
    uploadStep: 1,
};

const baseVideos = [
    { id: 1, title: "Apple Vision Pro - The Future is Here", channel: "TechMaster", views: "1.2M", time: "2d ago", duration: "12:45", quality: "4K", thumbnail: "https://images.unsplash.com/photo-1684369175833-0bb652431669?q=80&w=640" },
    { id: 2, title: "Extreme Adventure: Edge of Life", channel: "NatureFocus", views: "850K", time: "5h ago", duration: "08:12", quality: "18+", thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=640" },
    { id: 3, title: "Code Craft: Advanced Systems", channel: "CodeCraft", views: "3.5M", time: "1m ago", duration: "45:00", quality: "4K", thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=640" }
];

function renderVideos() {
    const grid = document.getElementById('video-grid');
    if (!grid) return;
    const allVideos = [...MockDatabase.getUploadedVideos(), ...baseVideos];
    grid.innerHTML = allVideos.map(v => `
        <div class="video-card" onclick="playVideo(${v.id})">
            <div class="thumbnail-container">
                <div class="quality-badge">${v.quality}</div>
                <img src="${v.thumbnail}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=640'">
                <div class="duration">${v.duration}</div>
            </div>
            <div class="video-info">
                <div class="channel-icon"></div>
                <div class="video-details">
                    <h3>${v.title}</h3>
                    <p>${v.channel} • ${v.views} views • ${v.time}</p>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

window.showHome = function () {
    state.view = 'home';
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `<div class="video-grid" id="video-grid"></div>`;
    renderVideos();
    window.scrollTo(0, 0);
};

// --- MOBILE INTERACTIONS ---
const updateIndicator = (item) => {
    const nav = document.getElementById('mobile-bottom-nav');
    const indicator = document.getElementById('nav-indicator');
    if (!nav || !indicator || !item) return;

    // Use requestAnimationFrame for smooth layout sync
    requestAnimationFrame(() => {
        const itemRect = item.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const leftPos = itemRect.left - navRect.left + (itemRect.width / 2) - (indicator.offsetWidth / 2);
        indicator.style.transform = `translateX(${leftPos}px)`;
        indicator.style.width = `${itemRect.width * 0.8}px`; // dynamic width
    });
};

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        if (!item.getAttribute('onclick')) e.preventDefault();

        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        updateIndicator(item);

        // Mobile Search Toggle
        const searchBar = document.getElementById('mobile-search-bar');
        if (item.id === 'mobile-search-trigger') {
            searchBar.classList.add('show');
            document.getElementById('mobile-search-input').focus();
        } else {
            searchBar?.classList.remove('show');
        }

        // Profile Menu Toggle
        if (item.id === 'mobile-profile-trigger') {
            document.getElementById('profile-menu').classList.toggle('show');
        } else {
            document.getElementById('profile-menu').classList.remove('show');
        }
    });
});

document.getElementById('mobile-create-trigger')?.addEventListener('click', () => {
    document.getElementById('upload-modal').classList.add('show');
});

// Sync on resize/orientation
window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-item.active');
    if (active) updateIndicator(active);
});

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    renderVideos();
    setTimeout(() => {
        document.getElementById('splash-screen')?.classList.add('fade-out');
        const active = document.querySelector('.nav-item.active');
        if (active) updateIndicator(active);
    }, 2500);
});

// Universal Handlers
document.getElementById('nav-signin-btn')?.addEventListener('click', () => document.getElementById('auth-modal').classList.add('show'));
document.getElementById('close-auth')?.addEventListener('click', () => document.getElementById('auth-modal').classList.remove('show'));
document.getElementById('close-upload-modal')?.addEventListener('click', () => document.getElementById('upload-modal').classList.remove('show'));
document.querySelector('.logout-red')?.addEventListener('click', () => { SessionService.destroy(); location.reload(); });
