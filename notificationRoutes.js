import express from "express";
import { createNotification, getNotifications } from "../controllers/notificationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route to create a notification
router.post("/", authenticate, createNotification);

// Route to get notifications
router.get("/", authenticate, getNotifications);

export default router;