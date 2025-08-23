// // Main application logic
// class SportifyApp {
//     constructor() {
//         this.currentUser = null;
//         this.currentPage = 'home';
//         this.socket = null;
//         this.init();
//     }

//     init() {
//         this.initNavigation();
//         this.initSocketConnection();
//         this.checkAuthStatus();
//         this.initEventListeners();
//         this.loadSampleData();
//     }

//     initNavigation() {
//         // Navigation event listeners
//         document.querySelectorAll('[data-page]').forEach(link => {
//             link.addEventListener('click', (e) => {
//                 e.preventDefault();
//                 const page = e.target.getAttribute('data-page');
//                 this.navigateTo(page);
//             });
//         });

//         // Mobile menu toggle (if needed)
//         this.handleMobileMenu();
//     }

//     navigateTo(page) {
//         // Hide all pages
//         document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        
//         // Show target page
//         const targetPage = document.getElementById(`${page}-page`);
//         if (targetPage) {
//             targetPage.classList.remove('hidden');
//             this.currentPage = page;
            
//             // Update navigation active states
//             document.querySelectorAll('.nav-link').forEach(link => {
//                 link.classList.remove('text-gray-900');
//                 link.classList.add('text-gray-500');
//             });
            
//             document.querySelector(`[data-page="${page}"]`).classList.remove('text-gray-500');
//             document.querySelector(`[data-page="${page}"]`).classList.add('text-gray-900');
            
//             // Load page-specific content
//             this.loadPageContent(page);
//         }
//     }

//     loadPageContent(page) {
//         switch(page) {
//             case 'discover':
//                 this.loadNearbyGames();
//                 break;
//             case 'profile':
//                 this.loadUserProfile();
//                 break;
//             case 'create':
//                 this.initCreateGameForm();
//                 break;
//         }
//     }

//     initSocketConnection() {
//         // Initialize Socket.io connection
//         this.socket = io('http://localhost:3000');
        
//         this.socket.on('connect', () => {
//             console.log('Connected to server');
//         });

//         this.socket.on('game_updated', (data) => {
//             this.handleGameUpdate(data);
//         });

//         this.socket.on('new_message', (data) => {
//             this.handleNewMessage(data);
//         });

//         this.socket.on('player_joined', (data) => {
//             this.handlePlayerJoined(data);
//         });
//     }

//     checkAuthStatus() {
//         // Check if user is logged in
//         const token = localStorage.getItem('sportify_token');
//         if (token) {
//             this.currentUser = JSON.parse(localStorage.getItem('sportify_user'));
//             this.updateUIForLoggedInUser();
//         }
//     }

//     updateUIForLoggedInUser() {
//         if (this.currentUser) {
//             document.getElementById('auth-btn').textContent = 'Sign Out';
//             document.getElementById('profile-name').textContent = this.currentUser.name;
//             document.getElementById('profile-location').textContent = this.currentUser.location;
//             document.getElementById('profile-avatar').textContent = this.getInitials(this.currentUser.name);
//         }
//     }

//     getInitials(name) {
//         return name.split(' ').map(n => n[0]).join('').toUpperCase();
//     }

//     initEventListeners() {
//         // Search functionality
//         document.getElementById('search-btn')?.addEventListener('click', () => {
//             this.searchGames();
//         });

//         // Auth button
//         document.getElementById('auth-btn').addEventListener('click', () => {
//             if (this.currentUser) {
//                 this.signOut();
//             } else {
//                 this.showAuthModal();
//             }
//         });

//         // Notifications
//         document.getElementById('notifications-btn').addEventListener('click', () => {
//             this.toggleNotifications();
//         });

//         // Sport cards click events
//         document.querySelectorAll('.sport-card').forEach(card => {
//             card.addEventListener('click', () => {
//                 const sport = card.querySelector('h4').textContent.toLowerCase();
//                 this.filterBySport(sport);
//             });
//         });
//     }

//     loadNearbyGames() {
//         const gamesList = document.getElementById('games-list');
        
//         // Sample games data
//         const sampleGames = [
//             {
//                 id: 1,
//                 title: 'Sunday Morning Football',
//                 sport: 'football',
//                 date: '2025-01-05',
//                 time: '10:00',
//                 location: 'Central Park',
//                 playersNeeded: 6,
//                 totalPlayers: 16,
//                 skillLevel: 'intermediate',
//                 organizer: 'Mike Johnson',
//                 distance: '2.3 km'
//             },
//             {
//                 id: 2,
//                 title: 'Basketball Pickup Game',
//                 sport: 'basketball',
//                 date: '2025-01-04',
//                 time: '18:00',
//                 location: 'Community Center',
//                 playersNeeded: 2,
//                 totalPlayers: 10,
//                 skillLevel: 'any',
//                 organizer: 'Sarah Davis',
//                 distance: '1.8 km'
//             },
//             {
//                 id: 3,
//                 title: 'Tennis Doubles Match',
//                 sport: 'tennis',
//                 date: '2025-01-06',
//                 time: '14:00',
//                 location: 'Tennis Club',
//                 playersNeeded: 1,
//                 totalPlayers: 4,
//                 skillLevel: 'advanced',
//                 organizer: 'Alex Chen',
//                 distance: '3.1 km'
//             }
//         ];

//         gamesList.innerHTML = sampleGames.map(game => this.createGameCard(game)).join('');
        
//         // Add join game event listeners
//         document.querySelectorAll('.join-game-btn').forEach(btn => {
//             btn.addEventListener('click', (e) => {
//                 const gameId = e.target.getAttribute('data-game-id');
//                 this.joinGame(gameId);
//             });
//         });
//     }

//     createGameCard(game) {
//         const sportEmoji = {
//             'football': '⚽',
//             'basketball': '🏀',
//             'tennis': '🎾',
//             'volleyball': '🏐'
//         };

//         const progressPercentage = ((game.totalPlayers - game.playersNeeded) / game.totalPlayers) * 100;

//         return `
//             <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
//                 <div class="flex items-start justify-between mb-4">
//                     <div class="flex items-center">
//                         <span class="text-3xl mr-3">${sportEmoji[game.sport]}</span>
//                         <div>
//                             <h4 class="font-bold text-lg text-gray-900">${game.title}</h4>
//                             <p class="text-sm text-gray-600">${game.organizer}</p>
//                         </div>
//                     </div>
//                     <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">${game.distance}</span>
//                 </div>
                
//                 <div class="space-y-2 mb-4">
//                     <div class="flex items-center text-sm text-gray-600">
//                         <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
//                         </svg>
//                         ${game.date} at ${game.time}
//                     </div>
//                     <div class="flex items-center text-sm text-gray-600">
//                         <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
//                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
//                         </svg>
//                         ${game.location}
//                     </div>
//                 </div>

//                 <div class="mb-4">
//                     <div class="flex justify-between items-center mb-2">
//                         <span class="text-sm text-gray-600">Players</span>
//                         <span class="text-sm font-medium">${game.totalPlayers - game.playersNeeded}/${game.totalPlayers}</span>
//                     </div>
//                     <div class="w-full bg-gray-200 rounded-full h-2">
//                         <div class="bg-success h-2 rounded-full" style="width: ${progressPercentage}%"></div>
//                     </div>
//                 </div>

//                 <div class="flex items-center justify-between">
//                     <span class="text-sm text-gray-600 capitalize">${game.skillLevel} level</span>
//                     <div class="flex space-x-2">
//                         <button class="text-secondary hover:text-blue-700 p-2" onclick="app.openGameChat(${game.id})">
//                             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
//                             </svg>
//                         </button>
//                         <button class="join-game-btn bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition duration-300" data-game-id="${game.id}">
//                             Join Game
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         `;
//     }

//     joinGame(gameId) {
//         if (!this.currentUser) {
//             this.showAuthModal();
//             return;
//         }

//         // Simulate joining game
//         this.showNotification('Successfully joined the game!', 'success');
        
//         // Emit socket event
//         this.socket.emit('join_game', {
//             gameId: gameId,
//             userId: this.currentUser.id
//         });
//     }

//     searchGames() {
//         const sport = document.getElementById('sport-filter').value;
//         const date = document.getElementById('date-filter').value;
//         const distance = document.getElementById('distance-filter').value;
        
//         // Implement search logic
//         console.log('Searching games:', { sport, date, distance });
//         this.loadNearbyGames(); // Reload with filters
//     }

//     filterBySport(sport) {
//         this.navigateTo('discover');
//         setTimeout(() => {
//             document.getElementById('sport-filter').value = sport;
//             this.searchGames();
//         }, 100);
//     }

//     loadUserProfile() {
//         if (!this.currentUser) {
//             this.showAuthModal();
//             return;
//         }

//         // Load recent games
//         const recentGamesContainer = document.getElementById('recent-games');
//         const recentGames = [
//             { title: 'Sunday Football', date: '2025-01-01', sport: 'football', status: 'completed' },
//             { title: 'Basketball Pickup', date: '2024-12-30', sport: 'basketball', status: 'completed' },
//             { title: 'Tennis Match', date: '2024-12-28', sport: 'tennis', status: 'completed' }
//         ];

//         recentGamesContainer.innerHTML = recentGames.map(game => `
//             <div class="flex items-center justify-between p-4 border rounded-lg">
//                 <div class="flex items-center">
//                     <span class="text-2xl mr-3">${this.getSportEmoji(game.sport)}</span>
//                     <div>
//                         <h4 class="font-medium">${game.title}</h4>
//                         <p class="text-sm text-gray-600">${game.date}</p>
//                     </div>
//                 </div>
//                 <span class="text-sm text-success capitalize">${game.status}</span>
//             </div>
//         `).join('');
//     }

//     getSportEmoji(sport) {
//         const emojis = {
//             'football': '⚽',
//             'basketball': '🏀',
//             'tennis': '🎾',
//             'volleyball': '🏐'
//         };
//         return emojis[sport] || '🏃';
//     }

//     initCreateGameForm() {
//         const form = document.getElementById('create-game-form');
//         if (!form) return;

//         form.addEventListener('submit', (e) => {
//             e.preventDefault();
//             this.createGame();
//         });

//         // Set default date to today
//         const today = new Date().toISOString().split('T')[0];
//         document.getElementById('create-date').value = today;
//     }

//     createGame() {
//         if (!this.currentUser) {
//             this.showAuthModal();
//             return;
//         }

//         const gameData = {
//             sport: document.getElementById('create-sport').value,
//             title: document.getElementById('create-title').value,
//             date: document.getElementById('create-date').value,
//             time: document.getElementById('create-time').value,
//             location: document.getElementById('create-location').value,
//             playersNeeded: parseInt(document.getElementById('create-players').value),
//             skillLevel: document.getElementById('create-skill').value,
//             description: document.getElementById('create-description').value,
//             organizer: this.currentUser.id
//         };

//         console.log('Creating game:', gameData);
        
//         // Simulate successful creation
//         this.showNotification('Game created successfully!', 'success');
        
//         // Reset form
//         document.getElementById('create-game-form').reset();
        
//         // Navigate to discover page
//         setTimeout(() => {
//             this.navigateTo('discover');
//         }, 1500);
//     }

//     showNotification(message, type = 'info') {
//         // Create notification element
//         const notification = document.createElement('div');
//         notification.className = `fixed top-20 right-4 p-4 rounded-md shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
        
//         const bgColor = {
//             'success': 'bg-success text-white',
//             'error': 'bg-danger text-white',
//             'warning': 'bg-warning text-white',
//             'info': 'bg-secondary text-white'
//         }[type] || 'bg-gray-800 text-white';
        
//         notification.className += ` ${bgColor}`;
//         notification.textContent = message;
        
//         document.body.appendChild(notification);
        
//         // Animate in
//         setTimeout(() => {
//             notification.classList.remove('translate-x-full');
//         }, 100);
        
//         // Remove after 3 seconds
//         setTimeout(() => {
//             notification.classList.add('translate-x-full');
//             setTimeout(() => {
//                 document.body.removeChild(notification);
//             }, 300);
//         }, 3000);
//     }

//     openGameChat(gameId) {
//         const chatModal = document.getElementById('chat-modal');
//         const chatContainer = document.getElementById('chat-container');
        
//         chatModal.classList.remove('hidden');
//         setTimeout(() => {
//             chatContainer.classList.remove('translate-x-full');
//         }, 100);
        
//         // Load chat messages for this game
//         this.loadChatMessages(gameId);
//     }

//     loadChatMessages(gameId) {
//         // This will be implemented in chat.js
//         window.chatSystem?.loadGameChat(gameId);
//     }

//     showAuthModal() {
//         // This will be implemented in auth.js
//         window.authSystem?.showModal();
//     }

//     signOut() {
//         localStorage.removeItem('sportify_token');
//         localStorage.removeItem('sportify_user');
//         this.currentUser = null;
//         document.getElementById('auth-btn').textContent = 'Sign In';
//         this.navigateTo('home');
//         this.showNotification('Signed out successfully', 'success');
//     }

//     toggleNotifications() {
//         const dropdown = document.getElementById('notifications-dropdown');
//         dropdown.classList.toggle('hidden');
        
//         if (!dropdown.classList.contains('hidden')) {
//             this.loadNotifications();
//         }
//     }

//     loadNotifications() {
//         const notificationsList = document.getElementById('notifications-list');
        
//         // Sample notifications
//         const notifications = [
//             { id: 1, message: 'New player joined your football game', time: '2 minutes ago', read: false },
//             { id: 2, message: 'Game reminder: Basketball pickup in 1 hour', time: '45 minutes ago', read: false },
//             { id: 3, message: 'Your tennis match was confirmed', time: '2 hours ago', read: true }
//         ];
        
//         notificationsList.innerHTML = notifications.map(notif => `
//             <div class="p-4 border-b hover:bg-gray-50 ${notif.read ? '' : 'bg-blue-50'}">
//                 <p class="text-sm ${notif.read ? 'text-gray-600' : 'text-gray-900 font-medium'}">${notif.message}</p>
//                 <p class="text-xs text-gray-500 mt-1">${notif.time}</p>
//             </div>
//         `).join('');
        
//         // Update notification count
//         const unreadCount = notifications.filter(n => !n.read).length;
//         const countBadge = document.getElementById('notification-count');
//         if (unreadCount > 0) {
//             countBadge.textContent = unreadCount;
//             countBadge.classList.remove('hidden');
//         } else {
//             countBadge.classList.add('hidden');
//         }
//     }

//     loadSampleData() {
//         // Load initial notifications
//         this.loadNotifications();
//     }

//     handleMobileMenu() {
//         // Mobile menu implementation (if needed)
//         console.log('Mobile menu handler initialized');
//     }

//     handleGameUpdate(data) {
//         console.log('Game updated:', data);
//         this.showNotification(`Game "${data.title}" has been updated`, 'info');
//     }

//     handleNewMessage(data) {
//         console.log('New message:', data);
//         // This will be handled by chat.js
//     }

//     handlePlayerJoined(data) {
//         console.log('Player joined:', data);
//         this.showNotification(`${data.playerName} joined your game!`, 'success');
//     }
// }

// // Initialize the application
// const app = new SportifyApp();

// // Make app globally available
// window.app = app;
// --------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
/* ---------- SportifyApp adapter for the current single-file UI ---------- */
// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Generic navigation for ANY element with data-page (navbar + hero buttons)
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.currentTarget.getAttribute('data-page'); // use currentTarget, not e.target
        navigateTo(page);
      });
    });
  
    // Basic navigateTo() that matches your page IDs/classes
    function navigateTo(page) {
      // hide all pages
      document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
      // show target
      const target = document.getElementById(`${page}-page`);
      if (target) target.classList.remove('hidden');
  
      // update nav active state
      document.querySelectorAll('.nav-link').forEach(a => {
        a.classList.remove('text-gray-900');
        a.classList.add('text-gray-500');
        if (a.getAttribute('data-page') === page) {
          a.classList.add('text-gray-900');
          a.classList.remove('text-gray-500');
        }
      });
  
      // page-specific hooks (optional)
      if (page === 'discover') renderDiscover?.();
      if (page === 'create')   initCreateDefaults?.();
      if (page === 'profile')  renderProfile?.();
    }
  
    // Default page = home
    navigateTo('home');
  });
  
(() => {
    const gs = new window.GameSystem();
  
    // current user (default to "me" so you can create/join instantly)
    function getUser() { return localStorage.getItem('sportify_user') || 'me'; }
    function setUser(id) { localStorage.setItem('sportify_user', id); }
  
    // socket (optional)
    let socket = null;
    if (window.io) {
      try {
        socket = io('http://localhost:3000');
        socket.on('connect', () => console.log('[socket] connected'));
        socket.on('player_joined', (d)=> console.log('[socket] player_joined', d));
        socket.on('game_updated', (d)=> console.log('[socket] game_updated', d));
      } catch(e) { console.warn('Socket error', e); }
    }
  
    // small UI helpers
    function toast(msg, type='info') {
      const n = document.createElement('div');
      n.className = 'fixed top-20 right-4 px-4 py-3 rounded-md shadow-lg z-50 transition-transform duration-300 translate-x-full';
      const map = { success:'bg-green-600', error:'bg-red-600', warning:'bg-yellow-600', info:'bg-blue-600' };
      n.classList.add(map[type] || 'bg-gray-800', 'text-white');
      n.textContent = msg;
      document.body.appendChild(n);
      setTimeout(()=> n.classList.remove('translate-x-full'), 50);
      setTimeout(()=> { n.classList.add('translate-x-full'); setTimeout(()=> n.remove(), 300); }, 2600);
    }
  
    function navTo(page) {
      document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
      document.getElementById(`${page}-page`)?.classList.remove('hidden');
      document.querySelectorAll('.nav-link').forEach(a => {
        a.classList.remove('text-gray-900'); a.classList.add('text-gray-500');
        if (a.dataset.page === page) { a.classList.add('text-gray-900'); a.classList.remove('text-gray-500'); }
      });
      if (page === 'discover') renderDiscover();
      if (page === 'profile') renderProfile();
      if (page === 'create') initCreateDefaults();
    }
  
    // NAV LINKS
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navTo(link.getAttribute('data-page'));
      });
    });
  
    // HERO buttons -> already have data-page, we just keep same behavior
    // Also wire sport cards to filter by sport
    document.querySelectorAll('.sport-card').forEach(card => {
      card.addEventListener('click', () => {
        const sport = (card.querySelector('h4')?.textContent || '').trim().toLowerCase();
        // Ensure the sport exists in the select (append if missing)
        const sel = document.getElementById('sport-filter');
        if (sel && sport) {
          if (![...sel.options].some(o=>o.value===sport)) {
            const opt = document.createElement('option'); opt.value = sport; opt.textContent = sport[0].toUpperCase()+sport.slice(1);
            sel.appendChild(opt);
          }
          sel.value = sport;
        }
        navTo('discover');
        // Auto-search on next frame
        setTimeout(()=> searchGames(), 0);
      });
    });
  
    // Notifications (badge only, dropdown is commented out in HTML)
    const notifications = [
      { id:1, message:'New player joined your football game', read:false },
      { id:2, message:'Game reminder: Basketball pickup in 1 hour', read:false },
      { id:3, message:'Your tennis match was confirmed', read:true },
    ];
    function refreshNotifBadge() {
      const badge = document.getElementById('notification-count');
      if (!badge) return;
      const unread = notifications.filter(n=>!n.read).length;
      badge.textContent = unread;
      badge.classList.toggle('hidden', unread===0);
    }
    document.getElementById('notifications-btn')?.addEventListener('click', ()=> {
      refreshNotifBadge();
      toast('Notifications panel is not enabled in this demo.', 'info');
    });
  
    // Auth button (no modal in this HTML)
    document.getElementById('auth-btn')?.addEventListener('click', ()=> {
      const u = prompt('Enter a username (kept in localStorage):', getUser());
      if (!u) return;
      setUser(u);
      renderProfile();
      renderDiscover();
      toast(`Signed in as ${u}`, 'success');
    });
  
    /* -------------------- DISCOVER -------------------- */
    function createCard(game) {
      const progressPct = Math.min(
        100,
        Math.round(((game.totalPlayers - (game.playersNeeded ?? 0)) / game.totalPlayers) * 100)
      );
      const canJoin = !game.participants.includes(getUser()) &&
        (!game.totalPlayers || game.participants.length < game.totalPlayers);
  
      return `
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center">
              <span class="text-3xl mr-3">${({
                football:'⚽', basketball:'🏀', tennis:'🎾', volleyball:'🏐', cricket:'🏏'
              }[game.sport] || '🏃')}</span>
              <div>
                <h4 class="font-bold text-lg text-gray-900">${escapeHtml(game.title)}</h4>
                <p class="text-sm text-gray-600">Organizer: ${escapeHtml(game.organizer)}</p>
              </div>
            </div>
            <span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">${escapeHtml(game.location || '')}</span>
          </div>
  
          <div class="space-y-2 mb-4 text-sm text-gray-600">
            <div class="flex items-center">
              <i class="fa-regular fa-calendar mr-2"></i>${game.date} at ${game.time}
            </div>
            <div class="flex items-center">
              <i class="fa-solid fa-users mr-2"></i>${game.participants.length}/${game.totalPlayers}
              ${typeof game.playersNeeded === 'number' ? ` • need ${game.playersNeeded}` : ''}
            </div>
            <div class="flex items-center capitalize">
              <i class="fa-solid fa-signal mr-2"></i>${escapeHtml(game.skillLevel)}
            </div>
          </div>
  
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-gray-600">Players</span>
              <span class="text-sm font-medium">${game.totalPlayers - (game.playersNeeded ?? 0)}/${game.totalPlayers}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-success h-2 rounded-full" style="width:${progressPct}%;"></div>
            </div>
          </div>
  
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">${(game.participants || []).slice(0,4).map(p=>`<span class="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-1">${escapeHtml(p)}</span>`).join('')}</span>
            <div class="flex space-x-2">
              <button class="text-secondary hover:text-blue-700 p-2" data-chat-id="${game.id}" title="Open chat">
                <i class="fa-regular fa-comments"></i>
              </button>
              ${canJoin
                ? `<button class="join-game-btn bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-orange-600 transition duration-300" data-game-id="${game.id}">Join Game</button>`
                : `<button class="leave-game-btn border px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition duration-300" data-game-id="${game.id}">${game.participants.includes(getUser()) ? 'Leave' : 'Full'}</button>`
              }
            </div>
          </div>
        </div>
      `;
    }
  
    function renderDiscover() {
      const grid = document.getElementById('games-list');
      if (!grid) return;
  
      // read filters
      const sport = document.getElementById('sport-filter')?.value || '';
      const date  = document.getElementById('date-filter')?.value || '';
      const dist  = Number(document.getElementById('distance-filter')?.value || 0);
  
      // try to get location for distance filter (only if selected)
      function run(center) {
        const list = gs.searchGames({
          sport: sport || undefined,
          date: date || undefined,
          distanceKm: dist || undefined,
          center: center || undefined,
        });
  
        grid.innerHTML = list.map(createCard).join('');
  
        // wire Join / Leave / Chat
        grid.querySelectorAll('.join-game-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-game-id');
            try {
              gs.joinGame(id, getUser());
              if (socket) socket.emit('join_game', { gameId: Number(id), userId: getUser() });
              toast('Joined the game!', 'success');
              renderDiscover();
            } catch (err) { toast(err?.message || 'Failed to join', 'error'); }
          });
        });
        grid.querySelectorAll('.leave-game-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-game-id');
            try {
              if (e.currentTarget.textContent === 'Full') return;
              gs.leaveGame(id, getUser());
              toast('Left the game', 'info');
              renderDiscover();
            } catch (err) { toast(err?.message || 'Failed to leave', 'error'); }
          });
        });
        grid.querySelectorAll('[data-chat-id]').forEach(btn => {
          btn.addEventListener('click', (e)=> {
            const id = e.currentTarget.getAttribute('data-chat-id');
            alert(`Chat for game #${id} (stub)`);
          });
        });
      }
  
      if (dist > 0 && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos)=> run({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          ()=> run(null), // on deny/err, just ignore distance
          { enableHighAccuracy: true, timeout: 7000 }
        );
      } else {
        run(null);
      }
    }
  
    document.getElementById('search-btn')?.addEventListener('click', renderDiscover);
  
    /* -------------------- CREATE -------------------- */
    function initCreateDefaults() {
      const d = document.getElementById('create-date');
      if (d && !d.value) d.value = new Date().toISOString().slice(0,10);
    }
  
    document.getElementById('create-game-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const sport = document.getElementById('create-sport').value;
      const title = document.getElementById('create-title').value.trim();
      const date  = document.getElementById('create-date').value;
      const time  = document.getElementById('create-time').value;
      const location = document.getElementById('create-location').value.trim();
      const playersNeeded = parseInt(document.getElementById('create-players').value, 10);
      const skillLevel = document.getElementById('create-skill').value;
      const description = document.getElementById('create-description').value;
  
      if (!sport || !title || !date || !time || !location || !playersNeeded) {
        toast('Please fill all required fields', 'warning');
        return;
      }
  
      // Optional: ask for coords (skipped here). You can extend with a geocoder.
      try {
        gs.createGame({
          sport, title, date, time, location,
          playersNeeded,
          totalPlayers: playersNeeded + 1,  // organizer + needed
          skillLevel,
          description,
          organizer: getUser(),
          participants: [getUser()],
          coords: null, // if you add a geocoder, put {lat,lng}
        });
        gs.saveToStorage();
        toast('Game created!', 'success');
        e.target.reset();
        navTo('discover');
        renderDiscover();
        if (socket) socket.emit('game_created', { title, organizer: getUser() });
      } catch (err) {
        toast(err?.message || 'Failed to create game', 'error');
      }
    });
  
    /* -------------------- PROFILE -------------------- */
    function renderProfile() {
      const nameEl = document.getElementById('profile-name');
      const locEl  = document.getElementById('profile-location');
      const avEl   = document.getElementById('profile-avatar');
      const me = getUser();
      if (nameEl) nameEl.textContent = me;
      if (locEl)  locEl.textContent  = 'Local Player';
      if (avEl)   avEl.textContent   = (me[0] || 'U').toUpperCase();
  
      const recent = document.getElementById('recent-games');
      if (!recent) return;
      const upcoming = gs.getUpcomingGames(me);
      recent.innerHTML = upcoming.length ? upcoming.map(g=>{
        const dt = gs.getGameDateTime(g);
        return `
          <div class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center">
              <span class="text-2xl mr-3">${({
                football:'⚽', basketball:'🏀', tennis:'🎾', volleyball:'🏐', cricket:'🏏'
              }[g.sport] || '🏃')}</span>
              <div>
                <h4 class="font-medium">${escapeHtml(g.title)}</h4>
                <p class="text-sm text-gray-600">${dt.toLocaleDateString()} ${dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
              </div>
            </div>
            <span class="text-sm text-green-600 capitalize">upcoming</span>
          </div>`;
      }).join('') : `<div class="text-gray-600">No upcoming games yet.</div>`;
    }
  
    /* -------------------- INITIAL -------------------- */
    refreshNotifBadge();
    navTo('home'); // your navbar default highlights Home
  
    // helpers
    function escapeHtml(s){ return (s??'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
  
  })();
// DEV ONLY: clear games so fresh samples load each time
localStorage.removeItem('sportify_games');
