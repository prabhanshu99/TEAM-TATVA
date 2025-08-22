"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMatch = createMatch;
const Match_1 = require("../models/Match");
async function createMatch(req, res, next) {
    try {
        const { gameTitle, sport, date, time, location, playersNeeded, description } = req.body;
        // Minimal manual validation (kept simple; you can swap to zod/express-validator later)
        const required = { gameTitle, sport, date, time, location, playersNeeded };
        for (const [k, v] of Object.entries(required)) {
            if (v === undefined || v === null || v === "") {
                return res.status(400).json({ error: `Field '${k}' is required` });
            }
        }
        const match = await Match_1.Match.create({
            gameTitle,
            sport,
            date,
            time,
            location,
            playersNeeded: Number(playersNeeded),
            description
        });
        res.status(201).json({ message: "Match created", data: match });
    }
    catch (err) {
        next(err);
    }
}
