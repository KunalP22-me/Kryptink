# Notepad App with Authentication & MongoDB

Build a full-featured Notepad application in the **ON** folder, combining all patterns learned from the Time folder projects: authentication (JWT + bcrypt), MongoDB storage (Mongoose), CRUD operations, and proper MVC project structure.

## Proposed Changes

### Project Structure

```
ON/
├── app.js                  # Main server — Express setup, middleware, routes
├── package.json            # Updated with new dependencies
├── config/
│   └── db.js               # MongoDB connection (pattern from MongoDB project)
├── models/
│   ├── user.js             # User model with posts ref (pattern from post project)
│   └── note.js             # Note model — title, content, user ref, timestamps
├── middleware/
│   └── auth.js             # isloggedin JWT middleware (pattern from post project)
├── routes/
│   ├── auth.js             # Register, login, logout routes (pattern from login project)
│   └── notes.js            # Note CRUD routes (pattern from notepad project)
├── views/
│   ├── partials/
│   │   └── navbar.ejs      # Shared navigation bar
│   ├── register.ejs        # Registration form
│   ├── login.ejs           # Login form
│   ├── dashboard.ejs       # All user notes (main page after login)
│   ├── create.ejs          # Create new note form
│   ├── edit.ejs            # Edit note form
│   └── show.ejs            # View single note detail
└── public/
    └── css/
        └── style.css       # Custom CSS (dark theme, modern design)
```

---

### Dependencies

#### New packages to install
- `mongoose` — MongoDB ODM (used in all your MongoDB projects)
- `cookie-parser` — Parse cookies for JWT tokens (used in login & post projects)
- `ejs` — Template engine (used in all your projects)

#### Already installed
- `express`, `bcrypt`, `jsonwebtoken`, `nodemon` ✅

#### package.json updates
- Add `"start": "nodemon app.js"` script

---

### Config — `config/db.js`

- MongoDB connection to `mongodb://127.0.0.1:27017/notepadapp`
- Same pattern as your MongoDB & post project models

---

### Models

#### `models/user.js`
- Fields: `username`, `name`, `email`, `password` (hashed)
- Reference array: `notes` → ObjectId refs to Note model (same pattern as post project's `posts` array)

#### `models/note.js`
- Fields: `title`, `content`, `user` (ObjectId ref to User)
- Timestamps: `createdAt`, `updatedAt` using Mongoose `timestamps: true`

---

### Middleware — `middleware/auth.js`

- `isloggedin` function — same pattern as post project
- Checks `req.cookies.token`, verifies with JWT, sets `req.user`
- Redirects to `/login` if not authenticated (instead of just `res.send`)

---

### Routes

#### Auth Routes — `routes/auth.js`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/register` | Show register form |
| POST | `/register` | Create user with bcrypt hash, set JWT cookie |
| GET | `/login` | Show login form |
| POST | `/login` | Verify credentials, set JWT cookie |
| GET | `/logout` | Clear token cookie, redirect to login |

#### Note Routes — `routes/notes.js` (all protected by `isloggedin`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | List all notes for logged-in user |
| GET | `/note/create` | Show create note form |
| POST | `/note/create` | Save new note to MongoDB, link to user |
| GET | `/note/:id` | Show single note detail |
| GET | `/note/edit/:id` | Show edit form (only note owner) |
| POST | `/note/edit/:id` | Update note in MongoDB |
| POST | `/note/delete/:id` | Delete note from MongoDB |

---

### Views (EJS + Tailwind CSS via CDN)

All views will use a **dark theme** (zinc-900 background) consistent with your existing projects, with Tailwind CSS CDN.

- **navbar.ejs** — Navigation with logo, links, and logout button
- **register.ejs** — Registration form (username, name, email, age, password)
- **login.ejs** — Login form (email, password) with link to register
- **dashboard.ejs** — Grid/list of all notes with title, preview, date, edit/delete actions
- **create.ejs** — Form with title and content textarea
- **edit.ejs** — Pre-filled form with existing note data
- **show.ejs** — Full note view with edit/delete buttons

---

### Main Server — `app.js`

- Express setup with all middleware (json, urlencoded, cookieParser, static)
- EJS view engine
- MongoDB connection via `config/db.js`
- Mount auth routes and note routes
- Root `/` redirects to `/dashboard` if logged in, else `/login`
- Listen on port **8080**

---

## Open Questions

> [!IMPORTANT]
> **MongoDB**: This plan assumes MongoDB is running locally at `mongodb://127.0.0.1:27017`. Is your local MongoDB server running?

> [!NOTE]
> **Port**: I'll use port **8080** (same as your login project). Let me know if you want a different port.

## Verification Plan

### Manual Verification
1. Start the server with `npx nodemon app.js`
2. Test register → login → create note → view → edit → delete → logout flow
