// Express.js server for Sportify backend
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// In-memory storage (in production, use a proper database)
let games = [];
let users = [];
let messages = [];
let notifications = [];

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join user to their rooms based on games they're part of
    socket.on('join_user_rooms', (userId) => {
        const userGames = games.filter(game => 
            game.participants.includes(userId) || game.organizer === userId
        );
        
        userGames.forEach(game => {
            socket.join(`game_${game.id}`);
        });
        
        socket.join(`user_${userId}`);
    });

    // Handle game creation
    socket.on('game_created', (gameData) => {
        games.push(gameData);
        
        // Broadcast to all users in the area (simplified)
        socket.broadcast.emit('new_game_available', gameData);
        
        console.log('Game created:', gameData.title);
    });

    // Handle joining games
    socket.on('join_game', (data) => {
        const game = games.find(g => g.id === data.gameId);
        if (game) {
            socket.join(`game_${data.gameId}`);
            
            // Notify all participants
            io.to(`game_${data.gameId}`).emit('player_joined', {
                gameId: data.gameId,
                userId: data.userId,
                game: game,
                playerName: data.playerName || 'A player'
            });
        }
    });

    // Handle leaving games
    socket.on('leave_game', (data) => {
        socket.leave(`game_${data.gameId}`);
        
        // Notify remaining participants
        io.to(`game_${data.gameId}`).emit('player_left', {
            gameId: data.gameId,
            userId: data.userId,
            playerName: data.playerName || 'A player'
        });
    });

    // Handle game updates
    socket.on('game_updated', (data) => {
        const gameIndex = games.findIndex(g => g.id === data.gameId);
        if (gameIndex !== -1) {
            games[gameIndex] = { ...games[gameIndex], ...data.updates };
            
            // Notify all participants
            io.to(`game_${data.gameId}`).emit('game_updated', {
                gameId: data.gameId,
                updates: data.updates,
                game: games[gameIndex]
            });
        }
    });

    // Handle game deletion
    socket.on('game_deleted', (data) => {
        const gameIndex = games.findIndex(g => g.id === data.gameId);
        if (gameIndex !== -1) {
            const game = games[gameIndex];
            
            // Notify all participants
            io.to(`game_${data.gameId}`).emit('game_cancelled', {
                gameId: data.gameId,
                game: game,
                message: 'This game has been cancelled by the organizer'
            });
            
            games.splice(gameIndex, 1);
        }
    });

    // Handle chat messages
    socket.on('send_message', (messageData) => {
        messages.push(messageData);
        
        // Broadcast to all participants of the game
        io.to(`game_${messageData.gameId}`).emit('new_message', messageData);
        
        console.log('Message sent:', messageData.text);
    });

    // Handle typing indicators
    socket.on('user_typing', (data) => {
        socket.to(`game_${data.gameId}`).emit('user_typing', {
            userId: data.userId,
            userName: data.userName,
            gameId: data.gameId
        });
    });

    // Handle user location updates
    socket.on('update_location', (data) => {
        // Update user location and find nearby games
        const userIndex = users.findIndex(u => u.id === data.userId);
        if (userIndex !== -1) {
            users[userIndex].location = data.location;
            users[userIndex].coordinates = data.coordinates;
        }
        
        // Send nearby games
        const nearbyGames = findNearbyGames(data.coordinates, data.radius || 10);
        socket.emit('nearby_games_updated', nearbyGames);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// REST API Routes

// Get all games
app.get('/api/games', (req, res) => {
    const { sport, date, location, skillLevel } = req.query;
    let filteredGames = [...games];
    
    if (sport) {
        filteredGames = filteredGames.filter(game => game.sport === sport);
    }
    
    if (date) {
        filteredGames = filteredGames.filter(game => game.date === date);
    }
    
    if (skillLevel) {
        filteredGames = filteredGames.filter(game => 
            game.skillLevel === skillLevel || game.skillLevel === 'any'
        );
    }
    
    res.json(filteredGames);
});

// Get specific game
app.get('/api/games/:id', (req, res) => {
    const game = games.find(g => g.id === parseInt(req.params.id));
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
});

// Create new game
app.post('/api/games', (req, res) => {
    const gameData = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString(),
        participants: [req.body.organizer],
        status: 'active'
    };
    
    games.push(gameData);
    
    // Broadcast to nearby users
    io.emit('new_game_available', gameData);
    
    res.status(201).json(gameData);
});

// Update game
app.put('/api/games/:id', (req, res) => {
    const gameIndex = games.findIndex(g => g.id === parseInt(req.params.id));
    if (gameIndex === -1) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    games[gameIndex] = { ...games[gameIndex], ...req.body };
    
    // Notify participants via socket
    io.to(`game_${req.params.id}`).emit('game_updated', {
        gameId: parseInt(req.params.id),
        updates: req.body,
        game: games[gameIndex]
    });
    
    res.json(games[gameIndex]);
});

// Delete game
app.delete('/api/games/:id', (req, res) => {
    const gameIndex = games.findIndex(g => g.id === parseInt(req.params.id));
    if (gameIndex === -1) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    const game = games[gameIndex];
    
    // Notify participants
    io.to(`game_${req.params.id}`).emit('game_cancelled', {
        gameId: parseInt(req.params.id),
        game: game
    });
    
    games.splice(gameIndex, 1);
    res.json({ message: 'Game deleted successfully' });
});

// Join game
app.post('/api/games/:id/join', (req, res) => {
    const game = games.find(g => g.id === parseInt(req.params.id));
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    const userId = req.body.userId;
    
    if (game.participants.includes(userId)) {
        return res.status(400).json({ error: 'Already joined this game' });
    }
    
    if (game.participants.length >= game.totalPlayers) {
        return res.status(400).json({ error: 'Game is full' });
    }
    
    game.participants.push(userId);
    game.playersNeeded = Math.max(0, game.playersNeeded - 1);
    
    // Notify via socket
    io.to(`game_${req.params.id}`).emit('player_joined', {
        gameId: parseInt(req.params.id),
        userId: userId,
        game: game
    });
    
    res.json(game);
});

// Leave game
app.post('/api/games/:id/leave', (req, res) => {
    const game = games.find(g => g.id === parseInt(req.params.id));
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    const userId = req.body.userId;
    const participantIndex = game.participants.indexOf(userId);
    
    if (participantIndex === -1) {
        return res.status(400).json({ error: 'Not a participant of this game' });
    }
    
    game.participants.splice(participantIndex, 1);
    game.playersNeeded = Math.min(game.totalPlayers, game.playersNeeded + 1);
    
    // Notify via socket
    io.to(`game_${req.params.id}`).emit('player_left', {
        gameId: parseInt(req.params.id),
        userId: userId,
        game: game
    });
    
    res.json(game);
});

// Get game messages
app.get('/api/games/:id/messages', (req, res) => {
    const gameMessages = messages.filter(msg => msg.gameId === parseInt(req.params.id));
    res.json(gameMessages);
});

// Send message
app.post('/api/games/:id/messages', (req, res) => {
    const messageData = {
        id: Date.now(),
        gameId: parseInt(req.params.id),
        ...req.body,
        timestamp: new Date().toISOString()
    };
    
    messages.push(messageData);
    
    // Broadcast via socket
    io.to(`game_${req.params.id}`).emit('new_message', messageData);
    
    res.status(201).json(messageData);
});

// User management routes
app.post('/api/users', (req, res) => {
    const userData = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };
    
    users.push(userData);
    res.status(201).json(userData);
});

app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

// Get user's games
app.get('/api/users/:id/games', (req, res) => {
    const userId = parseInt(req.params.id);
    const userGames = games.filter(game => 
        game.participants.includes(userId) || game.organizer === userId
    );
    res.json(userGames);
});

// Helper functions
function findNearbyGames(coordinates, radius) {
    return games.filter(game => {
        if (!game.coordinates) return true;
        
        const distance = calculateDistance(
            coordinates.lat, coordinates.lng,
            game.coordinates.lat, game.coordinates.lng
        );
        
        return distance <= radius;
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Serve the main application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
server.listen(PORT, () => {
    console.log(`Sportify server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the application`);
});

module.exports = { app, server, io };