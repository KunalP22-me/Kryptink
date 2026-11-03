const express = require("express");
const cookieParser = require("cookie-parser");
const path = require("path");
const db = require("./config/db");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
require("dotenv").config();

const roomRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.set("trust proxy", 1); //if deployed on heroku

app.set("view engine", "ejs");
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Custom middleware to avoid Express 5 read-only errors
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body, { replaceWith: "_" });
    if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: "_" });
    next();
});

// Mount routes
app.use("/", roomRoutes);
app.use("/", noteRoutes);

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log("Server is running on port", PORT);
});
