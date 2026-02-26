// UI Components for Bhuban
// Reusable components that integrate with API service

// Comments Component
class CommentsComponent {
    constructor(videoId, containerId) {
        this.videoId = videoId;
        this.container = document.getElementById(containerId);
        this.comments = [];
        this.page = 1;
        this.hasMore = true;

        this.init();
    }

    async init() {
        this.render();
        await this.loadComments();
    }

    render() {
        this.container.innerHTML = `
            <div class="comments-section">
                <div class="comments-header">
                    <h3 class="comments-title">Comments</h3>
                </div>
                
                ${api.isAuthenticated() ? `
                    <div class="comment-input-container">
                        <div class="comment-avatar">${this.getAvatarInitial()}</div>
                        <div class="comment-input-wrapper">
                            <textarea 
                                id="comment-input-${this.videoId}" 
                                class="comment-input" 
                                placeholder="Add a comment..."
                                maxlength="500"
                            ></textarea>
                            <div class="comment-actions">
                                <button class="comment-cancel-btn" onclick="this.closest('.comment-input-wrapper').querySelector('textarea').value = ''">Cancel</button>
                                <button class="comment-submit-btn" onclick="commentsComponent.submitComment()">Comment</button>
                            </div>
                        </div>
                    </div>
                ` : `
                    <div class="comment-login-prompt">
                        <p>Please <a href="login.html">login</a> to comment</p>
                    </div>
                `}
                
                <div id="comments-list-${this.videoId}" class="comments-list">
                    <div class="loading">Loading comments...</div>
                </div>
            </div>
        `;
    }

    getAvatarInitial() {
        const user = api.getStoredUser();
        return user ? user.name.charAt(0).toUpperCase() : '?';
    }

    async loadComments() {
        try {
            const response = await api.getComments(this.videoId, this.page, 20);
            this.comments = response.data || [];
            this.renderComments();
        } catch (error) {
            console.error('Failed to load comments:', error);
            document.getElementById(`comments-list-${this.videoId}`).innerHTML =
                '<div class="error">Failed to load comments</div>';
        }
    }

    renderComments() {
        const listContainer = document.getElementById(`comments-list-${this.videoId}`);

        if (this.comments.length === 0) {
            listContainer.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
            return;
        }

        listContainer.innerHTML = this.comments.map(comment => this.renderComment(comment)).join('');
    }

    renderComment(comment) {
        const user = comment.userId || {};
        const isOwn = api.getStoredUser()?._id === user._id;

        return `
            <div class="comment" data-comment-id="${comment._id}">
                <div class="comment-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${user.name || 'Unknown'}</span>
                        <span class="comment-date">${this.formatDate(comment.createdAt)}</span>
                        ${comment.edited ? '<span class="comment-edited">(edited)</span>' : ''}
                    </div>
                    <div class="comment-text">${this.escapeHtml(comment.text)}</div>
                    <div class="comment-actions-bar">
                        <button class="comment-action-btn" onclick="commentsComponent.likeComment('${comment._id}')">
                            <i data-lucide="thumbs-up"></i>
                            <span>${comment.likes || 0}</span>
                        </button>
                        <button class="comment-action-btn" onclick="commentsComponent.showReplyInput('${comment._id}')">
                            <i data-lucide="message-circle"></i>
                            <span>Reply</span>
                        </button>
                        ${isOwn ? `
                            <button class="comment-action-btn" onclick="commentsComponent.editComment('${comment._id}')">
                                <i data-lucide="edit-2"></i>
                                <span>Edit</span>
                            </button>
                            <button class="comment-action-btn" onclick="commentsComponent.deleteComment('${comment._id}')">
                                <i data-lucide="trash-2"></i>
                                <span>Delete</span>
                            </button>
                        ` : ''}
                    </div>
                    <div id="reply-input-${comment._id}" class="reply-input-container" style="display: none;"></div>
                    ${comment.replyCount > 0 ? `
                        <button class="view-replies-btn" onclick="commentsComponent.loadReplies('${comment._id}')">
                            View ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}
                        </button>
                        <div id="replies-${comment._id}" class="replies-container"></div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async submitComment() {
        const input = document.getElementById(`comment-input-${this.videoId}`);
        const text = input.value.trim();

        if (!text) return;

        try {
            await api.addComment(this.videoId, text);
            input.value = '';
            await this.loadComments();
            lucide.createIcons();
        } catch (error) {
            alert('Failed to post comment: ' + error.message);
        }
    }

    async likeComment(commentId) {
        if (!api.isAuthenticated()) {
            alert('Please login to like comments');
            return;
        }

        try {
            await api.likeComment(commentId);
            await this.loadComments();
            lucide.createIcons();
        } catch (error) {
            console.error('Failed to like comment:', error);
        }
    }

    showReplyInput(commentId) {
        const container = document.getElementById(`reply-input-${commentId}`);
        container.style.display = 'block';
        container.innerHTML = `
            <div class="reply-input-wrapper">
                <textarea 
                    id="reply-input-text-${commentId}" 
                    class="comment-input" 
                    placeholder="Add a reply..."
                    maxlength="500"
                ></textarea>
                <div class="comment-actions">
                    <button class="comment-cancel-btn" onclick="document.getElementById('reply-input-${commentId}').style.display='none'">Cancel</button>
                    <button class="comment-submit-btn" onclick="commentsComponent.submitReply('${commentId}')">Reply</button>
                </div>
            </div>
        `;
    }

    async submitReply(parentCommentId) {
        const input = document.getElementById(`reply-input-text-${parentCommentId}`);
        const text = input.value.trim();

        if (!text) return;

        try {
            await api.addComment(this.videoId, text, parentCommentId);
            document.getElementById(`reply-input-${parentCommentId}`).style.display = 'none';
            await this.loadComments();
            lucide.createIcons();
        } catch (error) {
            alert('Failed to post reply: ' + error.message);
        }
    }

    async loadReplies(commentId) {
        try {
            const response = await api.getReplies(commentId);
            const repliesContainer = document.getElementById(`replies-${commentId}`);
            repliesContainer.innerHTML = response.data.map(reply => this.renderComment(reply)).join('');
            lucide.createIcons();
        } catch (error) {
            console.error('Failed to load replies:', error);
        }
    }

    async editComment(commentId) {
        const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`);
        const textEl = commentEl.querySelector('.comment-text');
        const currentText = textEl.textContent;

        const newText = prompt('Edit comment:', currentText);
        if (newText && newText.trim() && newText !=== currentText) {
            try {
                await api.updateComment(commentId, newText.trim());
                await this.loadComments();
                lucide.createIcons();
            } catch (error) {
                alert('Failed to update comment: ' + error.message);
            }
        }
    }

    async deleteComment(commentId) {
        if (!confirm('Delete this comment?')) return;

        try {
            await api.deleteComment(commentId);
            await this.loadComments();
            lucide.createIcons();
        } catch (error) {
            alert('Failed to delete comment: ' + error.message);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Subscribe Button Component
class SubscribeButton {
    constructor(channelId, containerId) {
        this.channelId = channelId;
        this.container = document.getElementById(containerId);
        this.isSubscribed = false;
        this.subscriberCount = 0;

        this.init();
    }

    async init() {
        await this.checkSubscription();
        this.render();
    }

    async checkSubscription() {
        if (!api.isAuthenticated()) {
            this.isSubscribed = false;
            return;
        }

        try {
            const response = await api.checkSubscription(this.channelId);
            this.isSubscribed = response.data.subscribed;
        } catch (error) {
            console.error('Failed to check subscription:', error);
        }
    }

    render() {
        if (!this.container) return;

        const subBtn = this.container.querySelector('#subscribe-btn') || this.container.querySelector('.subscribe-btn');
        const notifyBtn = this.container.querySelector('#notification-btn') || this.container.querySelector('.notification-btn');

        if (!api.isAuthenticated()) {
            if (subBtn) {
                subBtn.className = 'subscribe-btn not-subscribed';
                subBtn.textContent = 'Subscribe';
                subBtn.onclick = () => window.location.href = 'login.html';
            }
            if (notifyBtn) notifyBtn.style.display = 'none';
            return;
        }

        if (subBtn) {
            subBtn.className = `subscribe-btn ${this.isSubscribed ? 'subscribed' : 'not-subscribed'}`;
            subBtn.textContent = this.isSubscribed ? 'Subscribed' : 'Subscribe';
            subBtn.onclick = () => this.toggle();
        }

        if (notifyBtn) {
            notifyBtn.style.display = this.isSubscribed ? 'flex' : 'none';
            notifyBtn.onclick = () => alert('Notification settings coming soon!');
        }

        lucide.createIcons();
    }

    async toggle() {
        if (!api.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        try {
            if (this.isSubscribed) {
                const confirmed = confirm('Unsubscribe from this channel?');
                if (!confirmed) return;
                await api.unsubscribe(this.channelId);
                this.isSubscribed = false;
            } else {
                await api.subscribe(this.channelId);
                this.isSubscribed = true;
            }
            this.render();
        } catch (error) {
            alert('Failed to update subscription: ' + error.message);
        }
    }
}

// Global instances (will be initialized by pages)
window.commentsComponent = null;
window.subscribeButton = null;
