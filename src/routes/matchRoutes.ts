import { Router } from "express";
import { createMatch } from "../controllers/matchController";

const router = Router();

// POST /api/matches
router.post("/", createMatch);

export default router;
