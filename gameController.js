const Game = require('../models/Game');

// Create a new game
exports.createGame = async (req, res) => {
    try {
        const { title, sport, date, time, location, playersNeeded, skillLevel, organizer } = req.body;
        const newGame = new Game({
            title,
            sport,
            date,
            time,
            location,
            playersNeeded,
            totalPlayers: 1, // Starts with the organizer
            skillLevel,
            organizer,
            participants: [organizer],
            createdAt: new Date().toISOString(),
            status: 'active'
        });

        await newGame.save();
        res.status(201).json({ message: 'Game created successfully', game: newGame });
    } catch (error) {
        res.status(500).json({ message: 'Error creating game', error: error.message });
    }
};

// Join a game
exports.joinGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id; // Assuming user ID is available in req.user

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (game.participants.includes(userId)) {
            return res.status(400).json({ message: 'You are already a participant' });
        }

        if (game.totalPlayers >= game.playersNeeded) {
            return res.status(400).json({ message: 'Game is full' });
        }

        game.participants.push(userId);
        game.totalPlayers += 1;
        await game.save();

        res.status(200).json({ message: 'Joined game successfully', game });
    } catch (error) {
        res.status(500).json({ message: 'Error joining game', error: error.message });
    }
};

// Leave a game
exports.leaveGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const userId = req.user.id;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        if (!game.participants.includes(userId)) {
            return res.status(400).json({ message: 'You are not a participant' });
        }

        game.participants = game.participants.filter(participant => participant !== userId);
        game.totalPlayers -= 1;
        await game.save();

        res.status(200).json({ message: 'Left game successfully', game });
    } catch (error) {
        res.status(500).json({ message: 'Error leaving game', error: error.message });
    }
};

// Get all games
exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving games', error: error.message });
    }
};

// Get a specific game
exports.getGame = async (req, res) => {
    try {
        const { gameId } = req.params;
        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.status(200).json(game);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving game', error: error.message });
    }
};