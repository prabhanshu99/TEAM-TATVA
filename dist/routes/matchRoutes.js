"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchController_1 = require("../controllers/matchController");
const router = (0, express_1.Router)();
// POST /api/matches
router.post("/", matchController_1.createMatch);
exports.default = router;
