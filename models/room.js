const mongoose = require("mongoose");
const db = require("../config/db");

const roomSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
    },
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "note"
        }
    ],
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
}, { timestamps: true });

// TTL index — MongoDB auto-deletes documents when expiresAt passes
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-delete hook — also delete all notes in this room
roomSchema.pre("findOneAndDelete", async function () {
    const room = await this.model.findOne(this.getFilter());
    if (room) {
        const Note = mongoose.model("note");
        await Note.deleteMany({ room: room._id });
    }
});

module.exports = mongoose.model("room", roomSchema);
