// // Game management system - CLEAN VERSION
// class GameSystem {
//     constructor() {
//       this.STORAGE_KEY = 'sportify_games';
//       this.games = [];
//       this.userGames = [];
//       this.init();
//     }
  
//     init() {
//       this.loadGamesFromStorage();
//       this.initEventListeners();
//     }
  
//     initEventListeners() {
//       // TODO: Add DOM listeners for game cards, join/leave buttons, etc.
//     }
  
//     // ---------- CRUD ----------
//     async createGame(gameData) {
//       try {
//         const game = {
//           id: Date.now(),
//           ...gameData,
//           // normalize fields
//           sport: (gameData.sport || '').toLowerCase(),
//           skillLevel: (gameData.skillLevel || 'any').toLowerCase(),
//           createdAt: new Date().toISOString(),
//           participants: [gameData.organizer],
//           messages: [],
//           status: 'active',
//           // optional derived fields
//           playersNeeded:
//             typeof gameData.playersNeeded === 'number'
//               ? gameData.playersNeeded
//               : Math.max(0, (gameData.totalPlayers || 0) - 1),
//         };
  
//         // Prevent simple duplicates
//         const isDuplicate = this.games.some(g =>
//           g.title === game.title &&
//           g.sport === game.sport &&
//           g.date === game.date &&
//           g.time === game.time &&
//           g.location === game.location
//         );
//         if (isDuplicate) throw new Error('A similar game already exists');
  
//         this.games.push(game);
//         this.saveGamesToStorage();
  
//         if (window.app?.socket) {
//           window.app.socket.emit('game_created', game);
//         }
  
//         return game;
//       } catch (err) {
//         throw new Error(err?.message || 'Failed to create game');
//       }
//     }
  
//     async joinGame(gameId, userId) {
//       const game = this.getGame(gameId);
//       if (!game) throw new Error('Game not found');
  
//       if (game.participants.includes(userId)) {
//         throw new Error('Already joined this game');
//       }
  
//       if (typeof game.totalPlayers === 'number' &&
//           game.participants.length >= game.totalPlayers) {
//         throw new Error('Game is full');
//       }
  
//       game.participants.push(userId);
  
//       if (typeof game.playersNeeded === 'number') {
//         game.playersNeeded = Math.max(
//           0,
//           game.playersNeeded - 1
//         );
//       }
  
//       this.saveGamesToStorage();
  
//       if (window.app?.socket) {
//         window.app.socket.emit('player_joined', { gameId, userId, game });
//       }
  
//       return game;
//     }
  
//     async leaveGame(gameId, userId) {
//       const game = this.getGame(gameId);
//       if (!game) throw new Error('Game not found');
  
//       const idx = game.participants.indexOf(userId);
//       if (idx === -1) throw new Error('Not a participant of this game');
  
//       game.participants.splice(idx, 1);
  
//       if (typeof game.playersNeeded === 'number' &&
//           typeof game.totalPlayers === 'number') {
//         game.playersNeeded = Math.min(
//           game.totalPlayers - game.participants.length,
//           (game.playersNeeded || 0) + 1
//         );
//       }
  
//       this.saveGamesToStorage();
  
//       if (window.app?.socket) {
//         window.app.socket.emit('player_left', { gameId, userId, game });
//       }
  
//       return game;
//     }
  
//     async updateGame(gameId, updates, userId) {
//       const game = this.getGame(gameId);
//       if (!game) throw new Error('Game not found');
  
//       if (game.organizer !== userId) {
//         throw new Error('Only organizer can update game');
//       }
  
//       // normalize certain fields if present
//       const sanitized = { ...updates };
//       if (sanitized.sport) sanitized.sport = sanitized.sport.toLowerCase();
//       if (sanitized.skillLevel) sanitized.skillLevel = sanitized.skillLevel.toLowerCase();
  
//       Object.assign(game, sanitized);
//       this.saveGamesToStorage();
  
//       if (window.app?.socket) {
//         window.app.socket.emit('game_updated', { gameId, game, updates: sanitized });
//       }
  
//       return game;
//     }
  
//     async deleteGame(gameId, userId) {
//       const index = this.games.findIndex(g => g.id === Number(gameId));
//       if (index === -1) throw new Error('Game not found');
  
//       const game = this.games[index];
//       if (game.organizer !== userId) {
//         throw new Error('Only organizer can delete game');
//       }
  
//       this.games.splice(index, 1);
//       this.saveGamesToStorage();
  
//       if (window.app?.socket) {
//         window.app.socket.emit('game_deleted', { gameId, game });
//       }
  
//       return true;
//     }
  
//     // ---------- Queries / helpers ----------
//     searchGames(filters = {}) {
//       let list = [...this.games];
  
//       if (filters.sport) {
//         const s = filters.sport.toLowerCase();
//         list = list.filter(g => g.sport === s);
//       }
  
//       if (filters.date) {
//         list = list.filter(g => g.date === filters.date);
//       }
  
//       if (filters.skillLevel) {
//         const level = filters.skillLevel.toLowerCase();
//         list = list.filter(g => g.skillLevel === level || g.skillLevel === 'any');
//       }
  
//       if (filters.location) {
//         const q = filters.location.toLowerCase();
//         list = list.filter(g => (g.location || '').toLowerCase().includes(q));
//       }
  
//       if (filters.availableOnly) {
//         list = list.filter(g =>
//           typeof g.playersNeeded === 'number' ? g.playersNeeded > 0
//           : (typeof g.totalPlayers === 'number'
//              ? g.participants.length < g.totalPlayers
//              : true)
//         );
//       }
  
//       // Sort by datetime safely
//       list.sort((a, b) => this.getGameDateTime(a) - this.getGameDateTime(b));
//       return list;
//     }
  
//     getUserGames(userId) {
//       return this.games.filter(g => g.organizer === userId || g.participants.includes(userId));
//     }
  
//     getGame(gameId) {
//       return this.games.find(g => g.id === Number(gameId));
//     }
  
//     getUpcomingGames(userId) {
//       const now = Date.now();
//       return this.getUserGames(userId)
//         .filter(g => this.getGameDateTime(g).getTime() > now)
//         .sort((a, b) => this.getGameDateTime(a) - this.getGameDateTime(b));
//     }
  
//     // ---------- Storage ----------
//     saveGamesToStorage() {
//       localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.games));
//     }
  
//     loadGamesFromStorage() {
//       const str = localStorage.getItem(this.STORAGE_KEY);
//       if (str) {
//         try {
//           this.games = JSON.parse(str);
//         } catch {
//           this.games = [];
//         }
//       }
//       if (!this.games || this.games.length === 0) {
//         this.loadSampleGames();       // <- only seeds; no recursive init
//         this.saveGamesToStorage();
//       }
//     }
  
//     loadSampleGames() {
//       this.games = [
//         {
//           id: 1,
//           title: 'Sunday Morning Football',
//           sport: 'football',
//           date: '2023-10-15',
//           time: '10:00 AM',
//           location: 'Central Park',
//           playersNeeded: 10,
//           totalPlayers: 20,
//           skillLevel: 'intermediate',
//           organizer: 'John Doe',
//           participants: ['John Doe'],
//           createdAt: '2023-10-01T10:00:00Z',
//           status: 'active',
//         },
//         {
//           id: 2,
//           title: 'Basketball Evening',
//           sport: 'basketball',
//           date: '2023-10-20',
//           time: '6:00 PM',
//           location: 'Downtown Court',
//           playersNeeded: 5,
//           totalPlayers: 10,
//           skillLevel: 'beginner',
//           organizer: 'Jane Smith',
//           participants: ['Jane Smith'],
//           createdAt: '2023-10-05T18:00:00Z',
//           status: 'active',
//         },
//         {
//           id: 3,
//           title: 'Tennis Doubles',
//           sport: 'tennis',
//           date: '2023-10-18',
//           time: '4:00 PM',
//           location: 'City Tennis Club',
//           playersNeeded: 2,
//           totalPlayers: 4,
//           skillLevel: 'advanced',
//           organizer: 'Alice Johnson',
//           participants: ['Alice Johnson'],
//           createdAt: '2023-10-03T16:00:00Z',
//           status: 'active',
//         },
//         {
//           id: 4,
//           title: 'Volleyball Night',
//           sport: 'volleyball',
//           date: '2023-10-22',
//           time: '8:00 PM',
//           location: 'Beach Court',
//           playersNeeded: 6,
//           totalPlayers: 12,
//           skillLevel: 'intermediate',
//           organizer: 'Bob Brown',
//           participants: ['Bob Brown'],
//           createdAt: '2023-10-07T20:00:00Z',
//           status: 'active',
//         },
//       ];
//     }
  
//     // ---------- Geo ----------
//     getGamesByLocation(lat, lng, radiusKm = 10) {
//       return this.games.filter(g => {
//         if (!g.coordinates) return true;
//         const d = this.calculateDistance(lat, lng, g.coordinates.lat, g.coordinates.lng);
//         return d <= radiusKm;
//       });
//     }
  
//     calculateDistance(lat1, lon1, lat2, lon2) {
//       const R = 6371; // km
//       const dLat = this.deg2rad(lat2 - lat1);
//       const dLon = this.deg2rad(lon2 - lon1);
//       const a =
//         Math.sin(dLat / 2) ** 2 +
//         Math.cos(this.deg2rad(lat1)) *
//           Math.cos(this.deg2rad(lat2)) *
//           Math.sin(dLon / 2) ** 2;
//       return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     }
  
//     deg2rad(deg) {
//       return (deg * Math.PI) / 180;
//     }
  
//     // ---------- Date helpers ----------
//     getGameDateTime(game) {
//       // Try to build a robust Date from date + time; fallback to date only
//       // If you can, store an ISO `startAt` and parse that instead.
//       const s = `${game.date} ${game.time}`;
//       const d = new Date(s);
//       if (isNaN(d.getTime())) {
//         // try constructing ISO when time like "10:00 AM"
//         try {
//           // naive parse: convert "HH:MM AM/PM" to 24h
//           const m = (game.time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
//           if (m) {
//             let [_, hh, mm, ap] = m;
//             let H = parseInt(hh, 10) % 12;
//             if (/pm/i.test(ap)) H += 12;
//             return new Date(`${game.date}T${String(H).padStart(2, '0')}:${mm}:00`);
//           }
//         } catch {}
//         return new Date(game.date);
//       }
//       return d;
//     }
//   }
  
//   // Initialize & expose
//   const gameSystem = new GameSystem();
//   window.gameSystem = gameSystem;
//   ......................................................>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// games.js
class GameSystem {
    constructor() {
      this.STORAGE_KEY = 'sportify_games';
      this.games = [];
      this.loadFromStorage();
      if (!this.games.length) {
        this.loadSampleGames();
        this.saveToStorage();
      }
    }
  
    /* ---------- Storage ---------- */
    saveToStorage() {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.games));
    }
    loadFromStorage() {
      const s = localStorage.getItem(this.STORAGE_KEY);
      if (!s) { this.games = []; return; }
      try { this.games = JSON.parse(s) || []; } catch { this.games = []; }
    }
  
    /* ---------- Sample data (with your user "me") ---------- */
    loadSampleGames() {
      const today = new Date();
      const d = (days) => {
        const t = new Date(today); t.setDate(t.getDate() + days);
        return t.toISOString().slice(0,10);
      };
      this.games = [
        {
          id: 1,
          title: 'Sunday Morning Football',
          sport: 'football',
          date: d(2),
          time: '10:00',
          location: 'Central Park',
          coords: { lat: 40.785091, lng: -73.968285 },
          playersNeeded: 9,
          totalPlayers: 20,
          skillLevel: 'intermediate',
          organizer: 'john',
          participants: ['john','amy'],
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: 2,
          title: 'Basketball Evening',
          sport: 'basketball',
          date: d(5),
          time: '18:00',
          location: 'Downtown Court',
          coords: { lat: 40.712776, lng: -74.005974 },
          playersNeeded: 5,
          totalPlayers: 10,
          skillLevel: 'beginner',
          organizer: 'jane',
          participants: ['jane'],
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: 3,
          title: 'Tennis Doubles',
          sport: 'tennis',
          date: d(3),
          time: '16:00',
          location: 'City Tennis Club',
          coords: { lat: 40.73061, lng: -73.935242 },
          playersNeeded: 2,
          totalPlayers: 4,
          skillLevel: 'advanced',
          organizer: 'alice',
          participants: ['alice'],
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: 4,
          title: 'Volleyball Night',
          sport: 'volleyball',
          date: d(7),
          time: '20:00',
          location: 'Beach Court',
          coords: { lat: 34.019454, lng: -118.491191 },
          playersNeeded: 6,
          totalPlayers: 12,
          skillLevel: 'intermediate',
          organizer: 'bob',
          participants: ['bob'],
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        // Your own sample so you can test as "me"
        {
          id: 5,
          title: 'Cricket Weekend Fun',
          sport: 'cricket',
          date: d(4),
          time: '15:00',
          location: 'City Stadium',
          coords: { lat: 28.6139, lng: 77.2090 }, // New Delhi-ish, so distance filters can work in India too
          playersNeeded: 7,
          totalPlayers: 11,
          skillLevel: 'any',
          organizer: 'me',
          participants: ['me'],
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      ];
    }
  
    /* ---------- CRUD ---------- */
    createGame(gameData) {
      const game = {
        id: Date.now(),
        ...gameData,
        sport: (gameData.sport || '').toLowerCase(),
        skillLevel: (gameData.skillLevel || 'any').toLowerCase(),
        createdAt: new Date().toISOString(),
        messages: [],
        status: 'active',
      };
      // default total players from playersNeeded + current participants
      if (typeof game.totalPlayers !== 'number') {
        const base = (Array.isArray(game.participants) ? game.participants.length : 1) || 1;
        const pn = typeof game.playersNeeded === 'number' ? game.playersNeeded : 0;
        game.totalPlayers = base + pn;
      }
      // ensure participants array
      if (!Array.isArray(game.participants) || !game.participants.length) {
        game.participants = [game.organizer];
      }
  
      // Duplicate guard
      const dup = this.games.some(g =>
        g.title === game.title &&
        g.sport === game.sport &&
        g.date === game.date &&
        g.time === game.time &&
        g.location === game.location
      );
      if (dup) throw new Error('A similar game already exists');
  
      this.games.push(game);
      this.saveToStorage();
      return game;
    }
  
    joinGame(gameId, userId) {
      const game = this.getGame(gameId);
      if (!game) throw new Error('Game not found');
      if (game.participants.includes(userId)) throw new Error('Already joined this game');
      if (typeof game.totalPlayers === 'number' && game.participants.length >= game.totalPlayers) {
        throw new Error('Game is full');
      }
      game.participants.push(userId);
      if (typeof game.playersNeeded === 'number') {
        game.playersNeeded = Math.max(0, game.playersNeeded - 1);
      }
      this.saveToStorage();
      return game;
    }
  
    leaveGame(gameId, userId) {
      const game = this.getGame(gameId);
      if (!game) throw new Error('Game not found');
      const idx = game.participants.indexOf(userId);
      if (idx === -1) throw new Error('Not a participant of this game');
      game.participants.splice(idx, 1);
      if (typeof game.playersNeeded === 'number' && typeof game.totalPlayers === 'number') {
        game.playersNeeded = Math.min(
          game.totalPlayers - game.participants.length,
          (game.playersNeeded || 0) + 1
        );
      }
      this.saveToStorage();
      return game;
    }
  
    deleteGame(gameId, userId) {
      const index = this.games.findIndex(g => g.id === Number(gameId));
      if (index === -1) throw new Error('Game not found');
      const game = this.games[index];
      if (game.organizer !== userId) throw new Error('Only organizer can delete game');
      this.games.splice(index, 1);
      this.saveToStorage();
      return true;
    }
  
    updateGame(gameId, updates, userId) {
      const game = this.getGame(gameId);
      if (!game) throw new Error('Game not found');
      if (game.organizer !== userId) throw new Error('Only organizer can update game');
      const sanitized = { ...updates };
      if (sanitized.sport) sanitized.sport = sanitized.sport.toLowerCase();
      if (sanitized.skillLevel) sanitized.skillLevel = sanitized.skillLevel.toLowerCase();
      Object.assign(game, sanitized);
  
      if (typeof game.totalPlayers === 'number') {
        const maxNeed = Math.max(0, game.totalPlayers - game.participants.length);
        if (typeof game.playersNeeded !== 'number' || Number.isNaN(game.playersNeeded)) {
          game.playersNeeded = maxNeed;
        } else {
          game.playersNeeded = Math.min(maxNeed, Math.max(0, game.playersNeeded));
        }
      }
      this.saveToStorage();
      return game;
    }
  
    /* ---------- Queries ---------- */
    getGame(id) { return this.games.find(g => g.id === Number(id)); }
  
    getUpcomingGames(userId) {
      const now = Date.now();
      return this.games
        .filter(g => g.organizer === userId || g.participants.includes(userId))
        .filter(g => this.getGameDateTime(g).getTime() > now)
        .sort((a,b)=> this.getGameDateTime(a) - this.getGameDateTime(b));
    }
  
    searchGames({ sport, date, location, distanceKm, center } = {}) {
      let list = [...this.games];
      if (sport) list = list.filter(g => g.sport === sport.toLowerCase());
      if (date)  list = list.filter(g => g.date === date);
      if (location) {
        const q = location.toLowerCase();
        list = list.filter(g => (g.location || '').toLowerCase().includes(q));
      }
      if (distanceKm && center) {
        list = list.filter(g => {
          if (!g.coords) return true;
          const d = this.distanceKm(center.lat, center.lng, g.coords.lat, g.coords.lng);
          return d <= distanceKm;
        });
      }
      list.sort((a,b)=> this.getGameDateTime(a) - this.getGameDateTime(b));
      return list;
    }
  
    /* ---------- Helpers ---------- */
    getGameDateTime(game) {
      // accept "HH:mm" or "HH:mm AM/PM"
      let s = `${game.date} ${game.time}`;
      let d = new Date(s);
      if (!isNaN(d.getTime())) return d;
  
      const m = (game.time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (m) {
        let [_, hh, mm, ap] = m;
        let H = parseInt(hh,10) % 12;
        if (/pm/i.test(ap)) H += 12;
        return new Date(`${game.date}T${String(H).padStart(2,'0')}:${mm}:00`);
      }
      return new Date(game.date);
    }
  
    distanceKm(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const toRad = (a)=> a*Math.PI/180;
      const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
      const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
      return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
  }
  
  window.GameSystem = GameSystem;
  