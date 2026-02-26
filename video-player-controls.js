// Enhanced Video Player Controls
class VideoPlayerControls {
    constructor(videoElement, containerId) {
        this.video = videoElement;
        this.container = document.getElementById(containerId);
        this.isPlaying = false;
        this.currentQuality = 'auto';
        this.subtitlesEnabled = false;
        this.currentSubtitleTrack = null;
        this.playbackSpeed = 1;
        this.volume = 1;
        this.isMuted = false;
        this.isTheaterMode = false;
        this.isFullscreen = false;
        this.currentTime = 0;
        this.duration = 0;
        
        this.init();
    }

    init() {
        this.createControls();
        this.attachEventListeners();
    }

    createControls() {
        const controlsHTML = `
            <div class="video-controls-overlay" id="videoControlsOverlay">
                <!-- Center Play Button -->
                <div class="center-play-btn" id="centerPlayBtn">
                    <i data-lucide="play" class="center-play-icon"></i>
                </div>

                <!-- Bottom Controls Bar -->
                <div class="controls-bar" id="controlsBar">
                    <!-- Progress Bar -->
                    <div class="progress-container" id="progressContainer">
                        <div class="progress-bar" id="progressBar">
                            <div class="progress-filled" id="progressFilled"></div>
                            <div class="progress-handle" id="progressHandle"></div>
                        </div>
                        <div class="progress-tooltip" id="progressTooltip">0:00</div>
                    </div>

                    <!-- Control Buttons -->
                    <div class="controls-bottom">
                        <div class="controls-left">
                            <button class="control-btn" id="playPauseBtn" title="Play (k)">
                                <i data-lucide="play"></i>
                            </button>
                            <button class="control-btn" id="nextBtn" title="Next">
                                <i data-lucide="skip-forward"></i>
                            </button>
                            <div class="volume-control">
                                <button class="control-btn" id="volumeBtn" title="Mute (m)">
                                    <i data-lucide="volume-2"></i>
                                </button>
                                <div class="volume-slider" id="volumeSlider">
                                    <input type="range" min="0" max="100" value="100" id="volumeRange">
                                </div>
                            </div>
                            <div class="time-display" id="timeDisplay">
                                <span id="currentTime">0:00</span> / <span id="duration">0:00</span>
                            </div>
                        </div>

                        <div class="controls-right">
                            <button class="control-btn" id="subtitlesBtn" title="Subtitles/CC (c)">
                                <i data-lucide="closed-captioning"></i>
                            </button>
                            <button class="control-btn settings-btn" id="settingsBtn" title="Settings">
                                <i data-lucide="settings"></i>
                                <span class="new-badge">NEW</span>
                            </button>
                            <button class="control-btn" id="miniplayerBtn" title="Miniplayer (i)">
                                <i data-lucide="picture-in-picture-2"></i>
                            </button>
                            <button class="control-btn" id="theaterBtn" title="Theater mode (t)">
                                <i data-lucide="rectangle-horizontal"></i>
                            </button>
                            <button class="control-btn" id="fullscreenBtn" title="Fullscreen (f)">
                                <i data-lucide="maximize"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Settings Menu -->
                <div class="settings-menu" id="settingsMenu" style="display: none;">
                    <div class="settings-panel" id="mainSettings">
                        <div class="settings-item" data-action="quality">
                            <span>Quality</span>
                            <span class="settings-value">Auto</span>
                            <i data-lucide="chevron-right"></i>
                        </div>
                        <div class="settings-item" data-action="speed">
                            <span>Playback speed</span>
                            <span class="settings-value">Normal</span>
                            <i data-lucide="chevron-right"></i>
                        </div>
                        <div class="settings-item" data-action="subtitles">
                            <span>Subtitles/CC</span>
                            <span class="settings-value">Off</span>
                            <i data-lucide="chevron-right"></i>
                        </div>
                        <div class="settings-item" data-action="ambient">
                            <span>Ambient mode</span>
                            <span class="settings-value">Off</span>
                            <i data-lucide="chevron-right"></i>
                        </div>
                        <div class="settings-item" data-action="annotations">
                            <span>Annotations</span>
                            <span class="settings-value">Off</span>
                            <i data-lucide="chevron-right"></i>
                        </div>
                    </div>

                    <!-- Quality Panel -->
                    <div class="settings-panel" id="qualitySettings" style="display: none;">
                        <div class="settings-header">
                            <button class="back-btn" data-back="main">
                                <i data-lucide="chevron-left"></i>
                            </button>
                            <span>Quality</span>
                        </div>
                        <div class="settings-item" data-quality="auto">
                            <span>Auto</span>
                            <i data-lucide="check" class="check-icon"></i>
                        </div>
                        <div class="settings-item" data-quality="2160">
                            <span>2160p (4K)</span>
                        </div>
                        <div class="settings-item" data-quality="1440">
                            <span>1440p (2K)</span>
                        </div>
                        <div class="settings-item" data-quality="1080">
                            <span>1080p (HD)</span>
                        </div>
                        <div class="settings-item" data-quality="720">
                            <span>720p</span>
                        </div>
                        <div class="settings-item" data-quality="480">
                            <span>480p</span>
                        </div>
                        <div class="settings-item" data-quality="360">
                            <span>360p</span>
                        </div>
                    </div>

                    <!-- Speed Panel -->
                    <div class="settings-panel" id="speedSettings" style="display: none;">
                        <div class="settings-header">
                            <button class="back-btn" data-back="main">
                                <i data-lucide="chevron-left"></i>
                            </button>
                            <span>Playback speed</span>
                        </div>
                        <div class="settings-item" data-speed="0.25">
                            <span>0.25</span>
                        </div>
                        <div class="settings-item" data-speed="0.5">
                            <span>0.5</span>
                        </div>
                        <div class="settings-item" data-speed="0.75">
                            <span>0.75</span>
                        </div>
                        <div class="settings-item" data-speed="1">
                            <span>Normal</span>
                            <i data-lucide="check" class="check-icon"></i>
                        </div>
                        <div class="settings-item" data-speed="1.25">
                            <span>1.25</span>
                        </div>
                        <div class="settings-item" data-speed="1.5">
                            <span>1.5</span>
                        </div>
                        <div class="settings-item" data-speed="1.75">
                            <span>1.75</span>
                        </div>
                        <div class="settings-item" data-speed="2">
                            <span>2</span>
                        </div>
                    </div>
                </div>

                <!-- Subtitles Menu -->
                <div class="subtitles-menu" id="subtitlesMenu" style="display: none;">
                    <div class="settings-item" data-subtitle="off">
                        <span>Off</span>
                        <i data-lucide="check" class="check-icon"></i>
                    </div>
                    <div class="settings-item" data-subtitle="en">
                        <span>English</span>
                    </div>
                    <div class="settings-item" data-subtitle="es">
                        <span>Spanish</span>
                    </div>
                    <div class="settings-item" data-subtitle="fr">
                        <span>French</span>
                    </div>
                    <div class="settings-item" data-subtitle="de">
                        <span>German</span>
                    </div>
                    <div class="settings-item" data-subtitle="auto">
                        <span>Auto-translate</span>
                    </div>
                </div>
            </div>
        `;

        this.container.insertAdjacentHTML('beforeend', controlsHTML);
        lucide.createIcons();
    }

    attachEventListeners() {
        // Play/Pause
        const playPauseBtn = document.getElementById('playPauseBtn');
        const centerPlayBtn = document.getElementById('centerPlayBtn');
        
        playPauseBtn.addEventListener('click', () => this.togglePlay());
        centerPlayBtn.addEventListener('click', () => this.togglePlay());
        this.video.addEventListener('click', () => this.togglePlay());

        // Progress bar
        const progressContainer = document.getElementById('progressContainer');
        progressContainer.addEventListener('click', (e) => this.seek(e));
        progressContainer.addEventListener('mousemove', (e) => this.showTooltip(e));

        // Volume
        const volumeBtn = document.getElementById('volumeBtn');
        const volumeRange = document.getElementById('volumeRange');
        volumeBtn.addEventListener('click', () => this.toggleMute());
        volumeRange.addEventListener('input', (e) => this.setVolume(e.target.value / 100));

        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        settingsBtn.addEventListener('click', () => this.toggleSettings());

        // Subtitles
        const subtitlesBtn = document.getElementById('subtitlesBtn');
        subtitlesBtn.addEventListener('click', () => this.toggleSubtitlesMenu());

        // Theater mode
        const theaterBtn = document.getElementById('theaterBtn');
        theaterBtn.addEventListener('click', () => this.toggleTheaterMode());

        // Fullscreen
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Miniplayer
        const miniplayerBtn = document.getElementById('miniplayerBtn');
        miniplayerBtn.addEventListener('click', () => this.toggleMiniplayer());

        // Video events
        this.video.addEventListener('timeupdate', () => this.updateProgress());
        this.video.addEventListener('loadedmetadata', () => this.updateDuration());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Settings navigation
        this.attachSettingsListeners();
    }

    attachSettingsListeners() {
        // Main settings items
        document.querySelectorAll('#mainSettings .settings-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.showSettingsPanel(action);
            });
        });

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.back;
                this.showSettingsPanel(target);
            });
        });

        // Quality selection
        document.querySelectorAll('[data-quality]').forEach(item => {
            item.addEventListener('click', () => {
                this.setQuality(item.dataset.quality);
            });
        });

        // Speed selection
        document.querySelectorAll('[data-speed]').forEach(item => {
            item.addEventListener('click', () => {
                this.setSpeed(parseFloat(item.dataset.speed));
            });
        });

        // Subtitle selection
        document.querySelectorAll('[data-subtitle]').forEach(item => {
            item.addEventListener('click', () => {
                this.setSubtitle(item.dataset.subtitle);
            });
        });
    }

    togglePlay() {
        if (this.video.paused) {
            this.video.play();
            this.isPlaying = true;
            document.querySelector('#playPauseBtn i').setAttribute('data-lucide', 'pause');
            document.getElementById('centerPlayBtn').style.opacity = '0';
        } else {
            this.video.pause();
            this.isPlaying = false;
            document.querySelector('#playPauseBtn i').setAttribute('data-lucide', 'play');
            document.getElementById('centerPlayBtn').style.opacity = '1';
        }
        lucide.createIcons();
    }

    seek(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        this.video.currentTime = percent * this.video.duration;
    }

    showTooltip(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * this.video.duration;
        const tooltip = document.getElementById('progressTooltip');
        tooltip.textContent = this.formatTime(time);
        tooltip.style.left = `${e.clientX - rect.left}px`;
    }

    updateProgress() {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        document.getElementById('progressFilled').style.width = `${percent}%`;
        document.getElementById('progressHandle').style.left = `${percent}%`;
        document.getElementById('currentTime').textContent = this.formatTime(this.video.currentTime);
    }

    updateDuration() {
        document.getElementById('duration').textContent = this.formatTime(this.video.duration);
    }

    formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    toggleMute() {
        this.video.muted = !this.video.muted;
        this.isMuted = this.video.muted;
        const icon = this.isMuted ? 'volume-x' : 'volume-2';
        document.querySelector('#volumeBtn i').setAttribute('data-lucide', icon);
        lucide.createIcons();
    }

    setVolume(value) {
        this.video.volume = value;
        this.volume = value;
        
        let icon = 'volume-2';
        if (value === 0) icon = 'volume-x';
        else if (value < 0.5) icon = 'volume-1';
        
        document.querySelector('#volumeBtn i').setAttribute('data-lucide', icon);
        lucide.createIcons();
    }

    toggleSettings() {
        const menu = document.getElementById('settingsMenu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        document.getElementById('subtitlesMenu').style.display = 'none';
    }

    toggleSubtitlesMenu() {
        const menu = document.getElementById('subtitlesMenu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        document.getElementById('settingsMenu').style.display = 'none';
    }

    showSettingsPanel(panel) {
        document.querySelectorAll('.settings-panel').forEach(p => p.style.display = 'none');
        
        if (panel === 'main') {
            document.getElementById('mainSettings').style.display = 'block';
        } else if (panel === 'quality') {
            document.getElementById('qualitySettings').style.display = 'block';
        } else if (panel === 'speed') {
            document.getElementById('speedSettings').style.display = 'block';
        }
    }

    setQuality(quality) {
        this.currentQuality = quality;
        document.querySelectorAll('[data-quality] .check-icon').forEach(icon => icon.remove());
        const selected = document.querySelector(`[data-quality="${quality}"]`);
        selected.insertAdjacentHTML('beforeend', '<i data-lucide="check" class="check-icon"></i>');
        lucide.createIcons();
        
// DEBUG: console.log(`Quality changed to: ${quality}`);
        this.showSettingsPanel('main');
    }

    setSpeed(speed) {
        this.video.playbackRate = speed;
        this.playbackSpeed = speed;
        document.querySelectorAll('[data-speed] .check-icon').forEach(icon => icon.remove());
        const selected = document.querySelector(`[data-speed="${speed}"]`);
        selected.insertAdjacentHTML('beforeend', '<i data-lucide="check" class="check-icon"></i>');
        lucide.createIcons();
        
        this.showSettingsPanel('main');
    }

    setSubtitle(subtitle) {
        this.currentSubtitleTrack = subtitle;
        this.subtitlesEnabled = subtitle !=== 'off';
        document.querySelectorAll('[data-subtitle] .check-icon').forEach(icon => icon.remove());
        const selected = document.querySelector(`[data-subtitle="${subtitle}"]`);
        selected.insertAdjacentHTML('beforeend', '<i data-lucide="check" class="check-icon"></i>');
        lucide.createIcons();
        
// DEBUG: console.log(`Subtitles: ${subtitle}`);
        document.getElementById('subtitlesMenu').style.display = 'none';
    }

    toggleTheaterMode() {
        this.isTheaterMode = !this.isTheaterMode;
        this.container.classList.toggle('theater-mode');
        
        const icon = this.isTheaterMode ? 'rectangle-vertical' : 'rectangle-horizontal';
        document.querySelector('#theaterBtn i').setAttribute('data-lucide', icon);
        lucide.createIcons();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.container.requestFullscreen();
            this.isFullscreen = true;
            document.querySelector('#fullscreenBtn i').setAttribute('data-lucide', 'minimize');
        } else {
            document.exitFullscreen();
            this.isFullscreen = false;
            document.querySelector('#fullscreenBtn i').setAttribute('data-lucide', 'maximize');
        }
        lucide.createIcons();
    }

    toggleMiniplayer() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else {
            this.video.requestPictureInPicture();
        }
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key.toLowerCase()) {
            case 'k':
            case ' ':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'm':
                this.toggleMute();
                break;
            case 'f':
                this.toggleFullscreen();
                break;
            case 't':
                this.toggleTheaterMode();
                break;
            case 'i':
                this.toggleMiniplayer();
                break;
            case 'c':
                this.toggleSubtitlesMenu();
                break;
            case 'arrowleft':
                this.video.currentTime -= 5;
                break;
            case 'arrowright':
                this.video.currentTime += 5;
                break;
            case 'arrowup':
                e.preventDefault();
                this.setVolume(Math.min(1, this.video.volume + 0.1));
                document.getElementById('volumeRange').value = this.video.volume * 100;
                break;
            case 'arrowdown':
                e.preventDefault();
                this.setVolume(Math.max(0, this.video.volume - 0.1));
                document.getElementById('volumeRange').value = this.video.volume * 100;
                break;
        }
    }
}
