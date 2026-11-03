const roomModel = require("../models/room");

async function isInRoom(req, res, next) {
    let roomCode = req.cookies.roomCode;

    // No cookie → go to home
    if (!roomCode || roomCode === "") {
        return res.redirect("/");
    }

    // Find room by code
    let room = await roomModel.findOne({ code: roomCode });

    // Room not found or expired (TTL already deleted it)
    if (!room) {
        res.cookie("roomCode", "");
        return res.redirect("/");
    }

    // Check if expired manually (in case TTL hasn't cleaned up yet)
    if (new Date() > room.expiresAt) {
        res.cookie("roomCode", "");
        return res.redirect("/");
    }

    req.room = room;
    next();
}

module.exports = isInRoom;