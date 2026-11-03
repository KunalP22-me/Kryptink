const mongoose = require("mongoose");
const db = require("../config/db");

const noteSchema = new mongoose.Schema({
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "room"
    },
    title: String,
    content: String,
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("note", noteSchema);