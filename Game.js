import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    sport: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    playersNeeded: {
        type: Number,
        required: true
    },
    totalPlayers: {
        type: Number,
        required: true
    },
    skillLevel: {
        type: String,
        required: true
    },
    organizer: {
        type: String,
        required: true
    },
    participants: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const Game = mongoose.model("Game", gameSchema);

export default Game;