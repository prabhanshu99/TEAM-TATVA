// Chat system for real-time messaging
class ChatSystem {
    constructor() {
        this.currentGameId = null;
        this.messages = [];
        this.init();
    }

    init() {
        this.initEventListeners();
        this.loadMessagesFromStorage();
    }

    initEventListeners() {
        // Close chat modal
        document.getElementById('close-chat')?.addEventListener('click', () => {
            this.closeChat();
        });

        // Send message
        document.getElementById('send-message')?.addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send message
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Click outside modal to close
        document.getElementById('chat-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'chat-modal') {
                this.closeChat();
            }
        });

        // Socket event listeners
        if (window.app?.socket) {
            window.app.socket.on('new_message', (data) => {
                this.handleNewMessage(data);
            });

            window.app.socket.on('user_typing', (data) => {
                this.handleUserTyping(data);
            });
        }
    }

    openGameChat(gameId) {
        this.currentGameId = gameId;
        
        const chatModal = document.getElementById('chat-modal');
        const chatContainer = document.getElementById('chat-container');
        
        if (chatModal && chatContainer) {
            chatModal.classList.remove('hidden');
            setTimeout(() => {
                chatContainer.classList.remove('translate-x-full');
            }, 100);
            
            this.loadGameChat(gameId);
        }
    }

    closeChat() {
        const chatModal = document.getElementById('chat-modal');
        const chatContainer = document.getElementById('chat-container');
        
        if (chatContainer) {
            chatContainer.classList.add('translate-x-full');
            setTimeout(() => {
                if (chatModal) {
                    chatModal.classList.add('hidden');
                }
            }, 300);
        }
        
        this.currentGameId = null;
    }

    loadGameChat(gameId) {
        // Get game details
        const game = window.gameSystem?.getGame(gameId);
        if (!game) return;

        // Update chat header
        const chatHeader = document.querySelector('#chat-container h3');
        if (chatHeader) {
            chatHeader.textContent = `${game.title} Chat`;
        }

        // Load messages for this game
        const gameMessages = this.getGameMessages(gameId);
        this.displayMessages(gameMessages);
    }

    getGameMessages(gameId) {
        return this.messages.filter(msg => msg.gameId === parseInt(gameId));
    }

    displayMessages(messages) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = messages.map(msg => this.createMessageHTML(msg)).join('');
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createMessageHTML(message) {
        const currentUser = window.app?.currentUser;
        const isOwnMessage = currentUser && message.userId === currentUser.id;
        
        const messageClass = isOwnMessage ? 
            'ml-auto bg-primary text-white' : 
            'mr-auto bg-gray-200 text-gray-800';
        
        const timeFormatted = new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="mb-3">
                <div class="max-w-xs ${messageClass} rounded-lg px-3 py-2">
                    ${!isOwnMessage ? `<p class="text-xs font-semibold mb-1">${message.userName}</p>` : ''}
                    <p class="text-sm">${this.escapeHtml(message.text)}</p>
                    <p class="text-xs mt-1 opacity-75">${timeFormatted}</p>
                </div>
            </div>
        `;
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const messageText = input?.value.trim();
        
        if (!messageText || !this.currentGameId) return;

        const currentUser = window.app?.currentUser;
        if (!currentUser) {
            window.app?.showNotification('Please sign in to send messages', 'error');
            return;
        }

        const message = {
            id: Date.now(),
            gameId: this.currentGameId,
            userId: currentUser.id,
            userName: currentUser.name,
            text: messageText,
            timestamp: new Date().toISOString()
        };

        // Add message locally
        this.messages.push(message);
        this.saveMessagesToStorage();

        // Emit to socket for real-time updates
        if (window.app?.socket) {
            window.app.socket.emit('send_message', message);
        }

        // Display the message
        this.appendMessage(message);
        
        // Clear input
        if (input) {
            input.value = '';
        }
    }

    appendMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        messagesContainer.insertAdjacentHTML('beforeend', this.createMessageHTML(message));
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    handleNewMessage(data) {
        // Only handle messages for current game
        if (data.gameId !== this.currentGameId) {
            // Show notification for other games
            this.showMessageNotification(data);
            return;
        }

        // Add to local messages if not already present
        if (!this.messages.find(msg => msg.id === data.id)) {
            this.messages.push(data);
            this.saveMessagesToStorage();
        }

        // Display the message
        this.appendMessage(data);
    }

    showMessageNotification(message) {
        const game = window.gameSystem?.getGame(message.gameId);
        const gameName = game ? game.title : 'a game';
        
        window.app?.showNotification(
            `New message in ${gameName} from ${message.userName}`, 
            'info'
        );
    }

    handleUserTyping(data) {
        // Show typing indicator (implement if needed)
        console.log(`${data.userName} is typing...`);
    }

    saveMessagesToStorage() {
        localStorage.setItem('sportify_messages', JSON.stringify(this.messages));
    }

    loadMessagesFromStorage() {
        const messagesStr = localStorage.getItem('sportify_messages');
        if (messagesStr) {
            this.messages = JSON.parse(messagesStr);
        } else {
            // Load sample messages
            this.loadSampleMessages();
        }
    }

    loadSampleMessages() {
        this.messages = [
            {
                id: 1,
                gameId: 1,
                userId: 'demo_user_2',
                userName: 'Sarah Davis',
                text: 'Hey everyone! Looking forward to the game!',
                timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            },
            {
                id: 2,
                gameId: 1,
                userId: 'demo_user_3',
                userName: 'Mike Johnson',
                text: 'Same here! The weather looks perfect for football.',
                timestamp: new Date(Date.now() - 3000000).toISOString() // 50 minutes ago
            },
            {
                id: 3,
                gameId: 2,
                userId: 'demo_user_4',
                userName: 'Alex Chen',
                text: 'What should I bring to the basketball game?',
                timestamp: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
            }
        ];
        this.saveMessagesToStorage();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getUnreadMessagesCount(userId, gameId) {
        // In a real app, track read status per user
        return this.getGameMessages(gameId).length;
    }

    markMessagesAsRead(gameId, userId) {
        // In a real app, mark messages as read
        console.log(`Marking messages as read for game ${gameId}, user ${userId}`);
    }
}

// Initialize chat system
const chatSystem = new ChatSystem();

// Make it globally available
window.chatSystem = chatSystem;