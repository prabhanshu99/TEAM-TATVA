import express from "express";
import { register, login } from "../controllers/authController.js";
import { validateRegister, validateLogin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register route
router.post("/register", validateRegister, register);

// Login route
router.post("/login", validateLogin, login);

export default router;