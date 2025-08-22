// Notification system for real-time updates
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.loadNotificationsFromStorage();
        this.initEventListeners();
        this.initSocketListeners();
        this.updateNotificationBadge();
    }

    initEventListeners() {
        // Notifications dropdown toggle
        document.getElementById('notifications-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNotificationsDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notifications-dropdown');
            const button = document.getElementById('notifications-btn');
            
            if (dropdown && !dropdown.contains(e.target) && !button?.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Mark notification as read when clicked
        this.initNotificationClickHandlers();
    }

    initSocketListeners() {
        if (window.app?.socket) {
            // Listen for various notification events
            window.app.socket.on('game_updated', (data) => {
                this.addNotification({
                    type: 'game_update',
                    title: 'Game Updated',
                    message: `"${data.title}" has been updated`,
                    gameId: data.id,
                    timestamp: new Date().toISOString()
                });
            });

            window.app.socket.on('player_joined', (data) => {
                const currentUser = window.app?.currentUser;
                if (currentUser && data.game.organizer === currentUser.id) {
                    this.addNotification({
                        type: 'player_joined',
                        title: 'New Player Joined',
                        message: `Someone joined your game "${data.game.title}"`,
                        gameId: data.gameId,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            window.app.socket.on('player_left', (data) => {
                const currentUser = window.app?.currentUser;
                if (currentUser && data.game.organizer === currentUser.id) {
                    this.addNotification({
                        type: 'player_left',
                        title: 'Player Left',
                        message: `Someone left your game "${data.game.title}"`,
                        gameId: data.gameId,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            window.app.socket.on('new_message', (data) => {
                const currentUser = window.app?.currentUser;
                if (currentUser && data.userId !== currentUser.id) {
                    const game = window.gameSystem?.getGame(data.gameId);
                    this.addNotification({
                        type: 'new_message',
                        title: 'New Message',
                        message: `${data.userName}: ${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}`,
                        gameId: data.gameId,
                        gameName: game?.title || 'Unknown Game',
                        timestamp: data.timestamp
                    });
                }
            });

            window.app.socket.on('game_reminder', (data) => {
                this.addNotification({
                    type: 'reminder',
                    title: 'Game Reminder',
                    message: `"${data.title}" starts in ${data.minutesUntil} minutes`,
                    gameId: data.id,
                    timestamp: new Date().toISOString(),
                    priority: 'high'
                });
            });
        }
    }

    toggleNotificationsDropdown() {
        const dropdown = document.getElementById('notifications-dropdown');
        if (!dropdown) return;

        dropdown.classList.toggle('hidden');
        
        if (!dropdown.classList.contains('hidden')) {
            this.displayNotifications();
            this.markAllAsRead();
        }
    }

    displayNotifications() {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        // Sort notifications by timestamp (newest first)
        const sortedNotifications = [...this.notifications].sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        container.innerHTML = sortedNotifications
            .slice(0, 20) // Show only last 20 notifications
            .map(notification => this.createNotificationHTML(notification))
            .join('');

        this.initNotificationClickHandlers();
    }

    createNotificationHTML(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const isUnread = !notification.read;
        
        const priorityClass = notification.priority === 'high' ? 'border-l-4 border-l-warning' : '';
        const unreadClass = isUnread ? 'bg-blue-50 font-medium' : '';

        return `
            <div class="notification-item p-4 border-b hover:bg-gray-50 cursor-pointer ${priorityClass} ${unreadClass}" 
                 data-notification-id="${notification.id}" 
                 data-game-id="${notification.gameId || ''}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center">
                            <span class="notification-icon mr-2">${this.getNotificationIcon(notification.type)}</span>
                            <h4 class="text-sm font-semibold text-gray-900">${notification.title}</h4>
                            ${isUnread ? '<span class="ml-2 w-2 h-2 bg-primary rounded-full"></span>' : ''}
                        </div>
                        <p class="text-sm text-gray-600 mt-1">${notification.message}</p>
                        <p class="text-xs text-gray-500 mt-1">${timeAgo}</p>
                    </div>
                </div>
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            'game_update': '🎮',
            'player_joined': '👤',
            'player_left': '👋',
            'new_message': '💬',
            'reminder': '⏰',
            'game_cancelled': '❌',
            'default': '📢'
        };
        return icons[type] || icons.default;
    }

    addNotification(notification) {
        const newNotification = {
            id: Date.now(),
            read: false,
            ...notification
        };

        this.notifications.push(newNotification);
        this.unreadCount++;
        
        this.saveNotificationsToStorage();
        this.updateNotificationBadge();

        // Show browser notification if permission granted
        this.showBrowserNotification(newNotification);

        // Auto-remove old notifications (keep only last 100)
        if (this.notifications.length > 100) {
            this.notifications = this.notifications.slice(-100);
            this.saveNotificationsToStorage();
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById('notification-count');
        if (!badge) return;

        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
            }
        });
        
        this.unreadCount = 0;
        this.saveNotificationsToStorage();
        this.updateNotificationBadge();
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.saveNotificationsToStorage();
            this.updateNotificationBadge();
        }
    }

    initNotificationClickHandlers() {
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const notificationId = parseInt(e.currentTarget.getAttribute('data-notification-id'));
                const gameId = e.currentTarget.getAttribute('data-game-id');
                
                this.markAsRead(notificationId);
                
                // Handle notification click action
                if (gameId) {
                    this.handleNotificationClick(notificationId, gameId);
                }
            });
        });
    }

    handleNotificationClick(notificationId, gameId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (!notification) return;

        // Close notifications dropdown
        document.getElementById('notifications-dropdown')?.classList.add('hidden');

        // Navigate based on notification type
        switch (notification.type) {
            case 'new_message':
                // Open chat for the game
                window.chatSystem?.openGameChat(gameId);
                break;
            case 'game_update':
            case 'player_joined':
            case 'player_left':
            case 'reminder':
                // Navigate to game details or discover page
                window.app?.navigateTo('discover');
                break;
            default:
                break;
        }
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/icon-192.png', // Add app icon
                badge: '/icon-72.png'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    window.app?.showNotification('Notifications enabled!', 'success');
                }
            });
        }
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        
        return time.toLocaleDateString();
    }

    saveNotificationsToStorage() {
        localStorage.setItem('sportify_notifications', JSON.stringify(this.notifications));
        localStorage.setItem('sportify_unread_count', this.unreadCount.toString());
    }

    loadNotificationsFromStorage() {
        const notificationsStr = localStorage.getItem('sportify_notifications');
        const unreadCountStr = localStorage.getItem('sportify_unread_count');
        
        if (notificationsStr) {
            this.notifications = JSON.parse(notificationsStr);
        }
        
        if (unreadCountStr) {
            this.unreadCount = parseInt(unreadCountStr) || 0;
        } else {
            // Calculate unread count
            this.unreadCount = this.notifications.filter(n => !n.read).length;
        }

        // Load sample notifications for demo
        if (this.notifications.length === 0) {
            this.loadSampleNotifications();
        }
    }

    loadSampleNotifications() {
        const sampleNotifications = [
            {
                id: 1,
                type: 'player_joined',
                title: 'New Player Joined',
                message: 'Someone joined your football game',
                gameId: 1,
                timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
                read: false
            },
            {
                id: 2,
                type: 'reminder',
                title: 'Game Reminder',
                message: 'Basketball pickup starts in 1 hour',
                gameId: 2,
                timestamp: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
                read: false,
                priority: 'high'
            },
            {
                id: 3,
                type: 'game_update',
                title: 'Game Updated',
                message: 'Tennis match location has been changed',
                gameId: 3,
                timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                read: true
            }
        ];

        this.notifications = sampleNotifications;
        this.unreadCount = sampleNotifications.filter(n => !n.read).length;
        this.saveNotificationsToStorage();
    }

    // Schedule game reminders
    scheduleGameReminders(userId) {
        const upcomingGames = window.gameSystem?.getUpcomingGames(userId) || [];
        
        upcomingGames.forEach(game => {
            const gameTime = new Date(`${game.date} ${game.time}`);
            const now = new Date();
            const timeDiff = gameTime - now;
            
            // Schedule reminder 1 hour before game
            const reminderTime = timeDiff - (60 * 60 * 1000); // 1 hour in milliseconds
            
            if (reminderTime > 0 && reminderTime < (24 * 60 * 60 * 1000)) { // Within 24 hours
                setTimeout(() => {
                    this.addNotification({
                        type: 'reminder',
                        title: 'Game Starting Soon',
                        message: `"${game.title}" starts in 1 hour`,
                        gameId: game.id,
                        priority: 'high'
                    });
                }, reminderTime);
            }
        });
    }
}

// Initialize notification system
const notificationSystem = new NotificationSystem();

// Make it globally available
window.notificationSystem = notificationSystem;

// Request notification permission on first load
window.addEventListener('load', () => {
    setTimeout(() => {
        notificationSystem.requestNotificationPermission();
    }, 2000);
});