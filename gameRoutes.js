import express from "express";
import { createGame, joinGame, leaveGame, getGames } from "../controllers/gameController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create a new game
router.post("/", authenticate, createGame);

// Join an existing game
router.post("/:gameId/join", authenticate, joinGame);

// Leave a game
router.post("/:gameId/leave", authenticate, leaveGame);

// Get all games
router.get("/", getGames);

export default router;