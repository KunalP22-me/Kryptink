# 📝 Kryptink — Ephemeral Room-Based Collaborative Notepad

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Web Speech API](https://img.shields.io/badge/Web_Speech_API-TTS-FFA500?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**Kryptink** is a privacy-first, zero-signup, room-based online notepad built with **Node.js, Express, MongoDB, EJS, and Tailwind CSS**. Share notes instantly via temporary 6-character room codes. All rooms and notes are ephemeral and automatically self-destruct after **24 hours** using MongoDB TTL (Time-To-Live) background indexes.

---

## ✨ Features

- ⚡ **Zero-Friction Rooms**: No account registration, email, or password required. Create an instant room or enter an existing 6-character alphanumeric code.
- 🎲 **Cryptographically Secure Room Codes**: Generated using Node.js native **`crypto.randomInt` (CSPRNG)** with uniform rejection sampling, preventing sequence prediction and modulo bias.
- ⏳ **Ephemeral by Design**: Rooms and notes automatically expire and are purged after **24 hours** via MongoDB TTL background indexes and Mongoose cascading delete middleware.
- ✍️ **Rich Text Editing**: Integrated **Quill.js** WYSIWYG editor supporting headers, typography, styling, lists, and formatting. Base64 image pasting is blocked to eliminate database bloat.
- 🗣️ **Built-in Text-to-Speech (TTS)**: Client-side narration powered by the **Web Speech API** targeting **Google हिन्दी (hi-IN)** at 1x speed, featuring sentence-chunking to bypass browser utterance cutoff limits.
- 💾 **Export & Sharing Suite**: 
  - One-click export to Markdown (`.md`)
  - One-click export to Plain Text (`.txt`)
  - Instant clipboard text copying
  - Clean print view (`@media print` strips navigation and UI controls)
  - Real-time word and character counters
- 🛡️ **Hardened Security Architecture**:
  - **CSPRNG Room Generation**: Resistant to brute-force sequence deduction.
  - **NoSQL Injection Defense**: Sanitizes all input bodies and parameters with `express-mongo-sanitize`.
  - **XSS & UI Redressing Defense**: Clean HTML sanitization via `sanitize-html` with `style` attributes completely stripped to prevent malicious fullscreen overlay phishing, and strict whitelisting for Quill classes.
  - **Brute-Force & Spam Throttling**: Strict `express-rate-limit` policies for room generation (3/min) and room code guessing (5/min).
  - **HTTP Security Headers**: Automated header protection via `helmet`.
  - **Secure Session Cookies**: `httpOnly`, `sameSite: "strict"` cookie management to prevent session hijacking.
- 🎨 **Modern Dark Mode Interface**: Built with Tailwind CSS on a sleek zinc/slate palette with local storage theme persistence.

---

## 🏛️ Project Architecture

```
ON/
├── config/
│   └── db.js                 # MongoDB Mongoose connection
├── middleware/
│   └── auth.js               # isInRoom session verification middleware
├── models/
│   ├── room.js               # Room schema with 24h TTL index & cascading delete hook
│   └── note.js               # Note schema linked to room with TTL index
├── public/
│   ├── css/
│   │   └── style.css         # Custom styling, dark mode & print media rules
│   └── js/
│       └── theme.js          # Theme toggle with localStorage persistence
├── routes/
│   ├── auth.js               # CSPRNG room creation, joining, rate limiting & leave
│   └── notes.js              # Note CRUD operations & strict XSS sanitization
├── views/
│   ├── home.ejs              # Landing page (create room or join with code)
│   ├── dashboard.ejs         # Note management dashboard for the active room
│   ├── create.ejs            # Note creation with Quill rich text editor
│   ├── edit.ejs              # Note edit interface with pre-filled content
│   └── show.ejs              # Full note reader view with TTS & export suite
├── .env.example              # Template for environment variables
├── .gitignore                # Git exclusions (node_modules, .env, logs)
├── app.js                    # Express application entrypoint & security middleware
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
   MONGO_URL=mongodb://127.0.0.1:27017/kryptink
   NODE_ENV=development
   ```

4. **Start the Application:**

   - **Development mode (with auto-reload):**
     ```bash
     npm run dev
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
| `POST` | `/create-room` | Rate-limited (3/min) | Generates a cryptographically secure 6-char room code & sets session cookie |
| `POST` | `/join-room` | Rate-limited (5/min) | Validates room code & expiration, sets session cookie |
| `GET` | `/leave` | Public | Clears room cookie and returns to landing page |
| `GET` | `/dashboard` | In Room | Displays all notes inside the current room with countdown timer |
| `GET` | `/note/create` | In Room | Displays the Quill rich-text note editor |
| `POST` | `/note/create` | In Room | Sanitizes note content and attaches it to the active room |
| `GET` | `/note/:id` | In Room | Displays the full content of a note with TTS, Export, & Print options |
| `GET` | `/note/edit/:id` | In Room | Loads note content into editor for modifications |
| `POST` | `/note/edit/:id` | In Room | Updates note title and sanitized content |
| `POST` | `/note/delete/:id` | In Room | Deletes the note and removes reference from the room |

---

## 🛡️ Security Mechanisms

### 1. CSPRNG Room Code Generation
Replaces predictable PRNGs (`Math.random()`) with kernel-level entropy to guarantee zero forward or backward sequence prediction:
```javascript
const crypto = require("crypto");

function generateCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(crypto.randomInt(chars.length));
    }
    return code;
}
```

### 2. Ephemeral TTL Expiration & Cascading Cleanup
```javascript
// MongoDB automatic document self-destruction after 24 hours
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-delete middleware removes all associated notes upon room deletion
roomSchema.pre("findOneAndDelete", async function () {
    const room = await this.model.findOne(this.getFilter());
    if (room) {
        await mongoose.model("note").deleteMany({ room: room._id });
    }
});
```

### 3. NoSQL Injection & Prototype Sanitization
All incoming payloads and query parameters are stripped of MongoDB operator syntax (`$` / `.`):
```javascript
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize.sanitize(req.body, { replaceWith: "_" });
    if (req.params) req.params = mongoSanitize.sanitize(req.params, { replaceWith: "_" });
    next();
});
```

### 4. XSS & UI Redressing Defense with Class Whitelisting
Rich text input is sanitized using strict tag allowances. Arbitrary inline `style` attributes are explicitly banned to prevent malicious full-screen overlay phishing, and only legitimate Quill classes are whitelisted:
```javascript
const sanitizeOptions = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'u', 's', 'span']),
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        '*': ['class'] // Dropped 'style' to eliminate UI overlay hijacking
    },
    allowedClasses: {
        '*': [
            'ql-align-center',
            'ql-align-right',
            'ql-align-justify',
            'ql-size-small',
            'ql-size-large',
            'ql-size-huge'
        ]
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
- **Client Speech**: Native [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- **Security & Utilities**:
  - `crypto` (Built-in) — Cryptographically secure pseudo-random number generator
  - `helmet` — HTTP header security
  - `express-rate-limit` — Request rate limiting (anti-abuse / anti-brute-force)
  - `express-mongo-sanitize` — NoSQL injection prevention
  - `sanitize-html` — HTML sanitation for XSS and UI redressing defense
  - `cookie-parser` — Cookie management (`httpOnly`, `SameSite=Strict`)
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
