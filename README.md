# 📝 Online Notepad (ON) — Ephemeral Room-Based Collaborative Notepad

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A privacy-first, zero-signup, room-based online notepad built with **Node.js, Express, MongoDB, EJS, and Tailwind CSS**. Share notes instantly via temporary 6-character room codes. All rooms and notes are ephemeral and automatically self-destruct after **24 hours** using MongoDB TTL (Time-To-Live) indexes.

---

## ✨ Features

- ⚡ **Zero-Friction Rooms**: No account registration, email, or password required. Create an instant room or enter an existing 6-character alphanumeric code.
- ⏳ **Ephemeral by Design**: Rooms and notes automatically expire and are purged after **24 hours** via MongoDB TTL background indexes.
- ✍️ **Rich Text Editing**: Integrated **Quill.js** WYSIWYG editor supporting headers, typography, styling, lists, and formatting.
- 🛡️ **Hardened Security Architecture**:
  - **NoSQL Injection Defense**: Sanitizes all input bodies and parameters with `express-mongo-sanitize`.
  - **Cross-Site Scripting (XSS) Protection**: Clean HTML sanitization with `sanitize-html` ensuring rich text formatting without arbitrary script execution.
  - **Brute-Force & Spam Throttling**: Strict `express-rate-limit` policies for room generation (3/min) and room code guessing (5/min).
  - **HTTP Security Headers**: Automated header protection via `helmet`.
  - **Secure Session Cookies**: `httpOnly`, `sameSite: "strict"` cookie management to prevent session hijacking.
- 🎨 **Modern Dark Mode Interface**: Built with Tailwind CSS on a sleek zinc/slate palette, fully mobile-responsive.
- 🗑️ **Cascading Cleanup**: Mongoose pre-delete middleware ensures all notes tied to a room are cleaned up automatically upon room deletion.

---

## 🏛️ Project Architecture

```
ON/
├── config/
│   └── db.js                 # MongoDB connection logic
├── middleware/
│   └── auth.js               # isInRoom session verification middleware
├── models/
│   ├── room.js               # Room schema with 24h TTL index & cascading delete hook
│   └── note.js               # Note schema linked to room with TTL index
├── public/
│   └── css/                  # Custom styling & assets
├── routes/
│   ├── auth.js               # Room creation, joining, rate limiting & session routes
│   └── notes.js              # Note CRUD operations & XSS sanitization
├── views/
│   ├── home.ejs              # Landing page (create room or join with code)
│   ├── dashboard.ejs         # Note management dashboard for the active room
│   ├── create.ejs            # Note creation with Quill rich text editor
│   ├── edit.ejs              # Note edit interface with pre-filled content
│   └── show.ejs              # Full note reader view
├── .env.example              # Template for environment variables
├── .gitignore                # Git exclusions (node_modules, .env, etc.)
├── app.js                    # Express application entrypoint & middleware configuration
└── package.json              # Project dependencies and npm scripts
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI)
- [Git](https://git-scm.com/)

---

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
   cd <YOUR_REPOSITORY>
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to create your `.env` file:
   ```bash
   cp .env.example .env
   ```

   Open `.env` and configure your settings:
   ```env
   PORT=8080
   MONGO_URL=mongodb://127.0.0.1:27017/notepadapp
   NODE_ENV=development
   ```

4. **Start the Application:**

   - **Development mode (with auto-reload):**
     ```bash
     npx nodemon app.js
     ```

   - **Production mode:**
     ```bash
     npm start
     ```

5. **Open in Browser:**
   Navigate to [http://localhost:8080](http://localhost:8080).

---

## 🔌 API & Route Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Landing page (Enter room code or generate new room) |
| `POST` | `/create-room` | Rate-limited (3/min) | Generates a new 6-character room and sets room cookie |
| `POST` | `/join-room` | Rate-limited (5/min) | Validates room code and expiration, sets room cookie |
| `GET` | `/leave` | Public | Clears room cookie and returns to landing page |
| `GET` | `/dashboard` | In Room | Displays all notes inside the current room |
| `GET` | `/note/create` | In Room | Displays the new note editor |
| `POST` | `/note/create` | In Room | Saves sanitized note and attaches it to the active room |
| `GET` | `/note/:id` | In Room | Displays the full content of a single note |
| `GET` | `/note/edit/:id` | In Room | Loads note content into editor for modifications |
| `POST` | `/note/edit/:id` | In Room | Updates title and sanitized content |
| `POST` | `/note/delete/:id` | In Room | Deletes the note and removes reference from the room |

---

## 🛡️ Security Mechanisms

### 1. Ephemeral TTL Expiration
```javascript
// MongoDB automatic document self-destruction after 24 hours
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

### 2. NoSQL Injection & Prototype Sanitization
All incoming payloads and query parameters are stripped of MongoDB operator syntax (`$` / `.`):
```javascript
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body, { replaceWith: "_" });
    if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: "_" });
    next();
});
```

### 3. XSS Sanitization with Quill Formatting Support
Rich text input is filtered through `sanitize-html` to block malicious script injections while preserving formatting tags:
```javascript
const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'u', 's']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class', 'style']
    }
};
```

---

## 🛠️ Tech Stack & Libraries

- **Backend**: [Express.js](https://expressjs.com/) on [Node.js](https://nodejs.org/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Templating**: [EJS](https://ejs.co/) (Embedded JavaScript templates)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Rich Text Editor**: [Quill.js](https://quilljs.com/)
- **Security & Utilities**:
  - `helmet` — HTTP header security
  - `express-rate-limit` — Request rate limiting
  - `express-mongo-sanitize` — NoSQL injection prevention
  - `sanitize-html` — HTML sanitation for XSS defense
  - `cookie-parser` — Cookie management
  - `dotenv` — Environment configuration

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m "Add some AmazingFeature"`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

