const express = require("express");
const router = express.Router();
const roomModel = require("../models/room");
const noteModel = require("../models/note");
const isInRoom = require("../middleware/auth");
const sanitizeHtml = require("sanitize-html");

// Configure sanitize-html to allow Quill editor formatting
const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'u', 's']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'style'] // Allow Quill's alignment classes and inline styles
    }
};
// GET /dashboard — List all notes in current room
router.get("/dashboard", isInRoom, async (req, res) => {
    try {
        let room = await roomModel.findOne({ _id: req.room._id }).populate("notes");
        res.render("dashboard", { room });
    } catch (err) {
        console.error(err);
        res.render("home", { error: "Something went wrong loading your dashboard!" });
    }
});

// GET /note/create — Show create note form
router.get("/note/create", isInRoom, (req, res) => {
    res.render("create");
});

// POST /note/create — Save new note to room
router.post("/note/create", isInRoom, async (req, res) => {
    try {
        let note = await noteModel.create({
            room: req.room._id,
            title: req.body.title,
            content: sanitizeHtml(req.body.content, sanitizeOptions),
            expiresAt: req.room.expiresAt
        });

        req.room.notes.push(note._id);
        await req.room.save();

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("home", { error: "Something went wrong saving your note!" });
    }
});

// GET /note/:id — View single note
router.get("/note/:id", isInRoom, async (req, res) => {
    try {
        let note = await noteModel.findOne({ _id: req.params.id, room: req.room._id });
        if (!note) return res.redirect("/dashboard");
        res.render("show", { note });
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});

// GET /note/edit/:id — Show edit form
router.get("/note/edit/:id", isInRoom, async (req, res) => {
    try {
        let note = await noteModel.findOne({ _id: req.params.id, room: req.room._id });
        if (!note) return res.redirect("/dashboard");
        res.render("edit", { note });
    } catch (err) {
        console.error(err);
        res.redirect("/dashboard");
    }
});

// POST /note/edit/:id — Update note
router.post("/note/edit/:id", isInRoom, async (req, res) => {
    try {
        await noteModel.findOneAndUpdate(
            { _id: req.params.id, room: req.room._id },
            { 
                title: req.body.title, 
                content: sanitizeHtml(req.body.content, sanitizeOptions) 
            }
        );
        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("home", { error: "Something went wrong updating your note!" });
    }
});

// POST /note/delete/:id — Delete note
router.post("/note/delete/:id", isInRoom, async (req, res) => {
    try {
        await noteModel.findOneAndDelete({ _id: req.params.id, room: req.room._id });

        // Also remove from room's notes array
        req.room.notes.pull(req.params.id);
        await req.room.save();

        res.redirect("/dashboard");
    } catch (err) {
        console.error(err);
        res.render("home", { error: "Something went wrong deleting your note!" });
    }
});

module.exports = router;