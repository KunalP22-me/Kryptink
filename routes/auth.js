const express = require("express");
const router = express.Router();
const roomModel = require("../models/room");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

const joinRoomLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    handler: (req, res) => {
        res.status(429).render("home", { error: "Too many attempts to join a room. Please try again after a minute." });
    },
    standardHeaders: true,   // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,    // Disable the `X-RateLimit-*` headers
});

const createRoomLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3,                  // Only allow 3 rooms to be created per minute per IP
    handler: (req, res) => {
        res.status(429).render("home", { error: "You are creating too many rooms. Please wait a minute." });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Generate random 6-char alphanumeric code
function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(crypto.randomInt(chars.length));
    }
    return code;
}

// GET / — Home page
router.get("/", (req, res) => {
    // If already in a room, go to dashboard
    if (req.cookies.roomCode && req.cookies.roomCode !== "") {
        return res.redirect("/dashboard");
    }
    res.render("home");
});

// POST /create-room — Generate new room
router.post("/create-room", createRoomLimiter, async (req, res) => {
    try {
        let code;
        let exists = true;

        // Keep generating until we get a unique code
        while (exists) {
            code = generateCode();
            exists = await roomModel.findOne({ code });
        }

        let room = await roomModel.create({ code });

        res.cookie("roomCode", room.code, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("home", { error: "Something went wrong creating the room!" });
    }
});

// POST /join-room — Enter existing room by code
router.post("/join-room", joinRoomLimiter, async (req, res) => {
    try {
        let code = req.body.code.toUpperCase().trim();

        let room = await roomModel.findOne({ code });

        if (!room) {
            return res.render("home", { error: "Room not found or expired!" });
        }

        // Check expiry
        if (new Date() > room.expiresAt) {
            return res.render("home", { error: "This room has expired!" });
        }

        res.cookie("roomCode", room.code, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        });

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("home", { error: "Something went wrong joining the room!" });
    }
});

// GET /leave — Leave room (clear cookie)
router.get("/leave", (req, res) => {
    res.cookie("roomCode", "");
    res.redirect("/");
});

module.exports = router;