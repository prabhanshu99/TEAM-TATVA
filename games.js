// Game management system
class GameSystem {
    constructor() {
        this.games = [];
        this.userGames = [];
        this.init();
    }

    init() {
        this.loadGamesFromStorage();
        this.initEventListeners();
    }

    initEventListeners() {
        // Game card interactions will be handled here
    }

    async createGame(gameData) {
        try {
            // Simulate API call
            const game = {
                id: Date.now(),
                ...gameData,
                createdAt: new Date().toISOString(),
                participants: [gameData.organizer],
                messages: [],
                status: 'active'
            };

            this.games.push(game);
            this.saveGamesToStorage();

            // Emit socket event for real-time updates
            if (window.app?.socket) {
                window.app.socket.emit('game_created', game);
            }

            return game;
        } catch (error) {
            throw new Error('Failed to create game');
        }
    }

    async joinGame(gameId, userId) {
        try {
            const game = this.games.find(g => g.id === parseInt(gameId));
            if (!game) {
                throw new Error('Game not found');
            }

            if (game.participants.includes(userId)) {
                throw new Error('Already joined this game');
            }

            if (game.participants.length >= game.totalPlayers) {
                throw new Error('Game is full');
            }

            game.participants.push(userId);
            game.playersNeeded = Math.max(0, game.playersNeeded - 1);
            
            this.saveGamesToStorage();

            // Emit socket event
            if (window.app?.socket) {
                window.app.socket.emit('player_joined', {
                    gameId: gameId,
                    userId: userId,
                    game: game
                });
            }

            return game;
        } catch (error) {
            throw error;
        }
    }

    async leaveGame(gameId, userId) {
        try {
            const game = this.games.find(g => g.id === parseInt(gameId));
            if (!game) {
                throw new Error('Game not found');
            }

            const participantIndex = game.participants.indexOf(userId);
            if (participantIndex === -1) {
                throw new Error('Not a participant of this game');
            }

            game.participants.splice(participantIndex, 1);
            game.playersNeeded = Math.min(game.totalPlayers, game.playersNeeded + 1);
            
            this.saveGamesToStorage();

            // Emit socket event
            if (window.app?.socket) {
                window.app.socket.emit('player_left', {
                    gameId: gameId,
                    userId: userId,
                    game: game
                });
            }

            return game;
        } catch (error) {
            throw error;
        }
    }

    async updateGame(gameId, updates, userId) {
        try {
            const game = this.games.find(g => g.id === parseInt(gameId));
            if (!game) {
                throw new Error('Game not found');
            }

            // Only organizer can update game
            if (game.organizer !== userId) {
                throw new Error('Only organizer can update game');
            }

            Object.assign(game, updates);
            this.saveGamesToStorage();

            // Emit socket event
            if (window.app?.socket) {
                window.app.socket.emit('game_updated', {
                    gameId: gameId,
                    game: game,
                    updates: updates
                });
            }

            return game;
        } catch (error) {
            throw error;
        }
    }

    async deleteGame(gameId, userId) {
        try {
            const gameIndex = this.games.findIndex(g => g.id === parseInt(gameId));
            if (gameIndex === -1) {
                throw new Error('Game not found');
            }

            const game = this.games[gameIndex];

            // Only organizer can delete game
            if (game.organizer !== userId) {
                throw new Error('Only organizer can delete game');
            }

            this.games.splice(gameIndex, 1);
            this.saveGamesToStorage();

            // Emit socket event
            if (window.app?.socket) {
                window.app.socket.emit('game_deleted', {
                    gameId: gameId,
                    game: game
                });
            }

            return true;
        } catch (error) {
            throw error;
        }
    }

    searchGames(filters = {}) {
        let filteredGames = [...this.games];

        // Filter by sport
        if (filters.sport) {
            filteredGames = filteredGames.filter(game => 
                game.sport.toLowerCase() === filters.sport.toLowerCase()
            );
        }

        // Filter by date
        if (filters.date) {
            filteredGames = filteredGames.filter(game => 
                game.date === filters.date
            );
        }

        // Filter by skill level
        if (filters.skillLevel) {
            filteredGames = filteredGames.filter(game => 
                game.skillLevel === filters.skillLevel || game.skillLevel === 'any'
            );
        }

        // Filter by location (basic text match)
        if (filters.location) {
            filteredGames = filteredGames.filter(game => 
                game.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Filter by availability (has open spots)
        if (filters.availableOnly) {
            filteredGames = filteredGames.filter(game => 
                game.playersNeeded > 0
            );
        }

        // Sort by date/time
        filteredGames.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });

        return filteredGames;
    }

    getUserGames(userId) {
        return this.games.filter(game => 
            game.participants.includes(userId) || game.organizer === userId
        );
    }

    getGame(gameId) {
        return this.games.find(g => g.id === parseInt(gameId));
    }

    saveGamesToStorage() {
        localStorage.setItem('sportify_games', JSON.stringify(this.games));
    }

    loadGamesFromStorage() {
        const gamesStr = localStorage.getItem('sportify_games');
        if (gamesStr) {
            this.games = JSON.parse(gamesStr);
        } else {
            // Load sample games for demo
            this.loadSampleGames();
        }
    }

    loadSampleGames() {
        this.games = [
            {
                id: 1,
                title: 'Sunday Morning Football',
                sport: 'football',
                date: '2025-01-05',
                time: '10:00',
                location: 'Central Park',
                playersNeeded: 6,
                totalPlayers: 16,
                skillLevel: 'intermediate',
                organizer: 'demo_user_1',
                description: 'Casual football game, all skill levels welcome!',
                participants: ['demo_user_1', 'demo_user_2', 'demo_user_3'],
                createdAt: new Date().toISOString(),
                status: 'active',
                coordinates: { lat: 40.785091, lng: -73.968285 }
            },
            {
                id: 2,
                title: 'Basketball Pickup Game',
                sport: 'basketball',
                date: '2025-01-04',
                time: '18:00',
                location: 'Community Center',
                playersNeeded: 2,
                totalPlayers: 10,
                skillLevel: 'any',
                organizer: 'demo_user_2',
                description: 'Evening basketball, looking for 2 more players.',
                participants: ['demo_user_2', 'demo_user_4'],
                createdAt: new Date().toISOString(),
                status: 'active',
                coordinates: { lat: 40.748817, lng: -73.985428 }
            },
            {
                id: 3,
                title: 'Tennis Doubles Match',
                sport: 'tennis',
                date: '2025-01-06',
                time: '14:00',
                location: 'Tennis Club',
                playersNeeded: 1,
                totalPlayers: 4,
                skillLevel: 'advanced',
                organizer: 'demo_user_3',
                description: 'Competitive doubles match, advanced players only.',
                participants: ['demo_user_3', 'demo_user_5'],
                createdAt: new Date().toISOString(),
                status: 'active',
                coordinates: { lat: 40.754932, lng: -73.984016 }
            }
        ];
        this.saveGamesToStorage();
    }

    getGamesByLocation(lat, lng, radius = 10) {
        // Simple distance calculation (in a real app, use proper geolocation APIs)
        return this.games.filter(game => {
            if (!game.coordinates) return true; // Include games without coordinates
            
            const distance = this.calculateDistance(
                lat, lng, 
                game.coordinates.lat, game.coordinates.lng
            );
            
            return distance <= radius;
        });
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula for distance calculation
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const d = R * c; // Distance in kilometers
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    getUpcomingGames(userId) {
        const userGames = this.getUserGames(userId);
        const now = new Date();
        
        return userGames.filter(game => {
            const gameDateTime = new Date(`${game.date} ${game.time}`);
            return gameDateTime > now;
        }).sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateA - dateB;
        });
    }
}

// Initialize game system
const gameSystem = new GameSystem();

// Make it globally available
window.gameSystem = gameSystem;