# Nexus — Deployment Guide

## What changed in this version
- **Responsive on any device**: `index.html` now uses fluid type (`clamp()`) and breakpoints — 4 cards on laptop, 2 on tablet, 1 on phone, with the hero stacking on small screens. The quiz/report/login pages already scaled with screen size (max-width + 100% width); they now also get tighter padding under 480–600px so nothing feels cramped on a phone.
- **Broken image paths fixed**: `index.html` was pointing at a file on your own laptop (`C:\Users\...`), which only works on your computer. It now loads `images/logo.jpeg` and `images/illustration.png` from inside the project, so it works for anyone, anywhere.
- **One deployable app instead of two**: `server.js` now also serves your HTML pages (`app.use(express.static('public'))`), and `login.html` / `signup.html` call `/api/login` and `/api/signup` (relative) instead of `http://localhost:3000/...`. That means one free hosted service can run the whole thing — no separate frontend host, no CORS headaches.

## Folder structure to deploy
```
nexus/
  server.js
  package.json
  setup.sql
  .env.example
  public/
    index.html, login.html, signup.html, mbti.html, stress.html, aptitude.html, report.html
    images/logo.jpeg, images/illustration.png
```

## Free hosting — step by step

**1. Get a free MySQL database.**
Any of these have a free tier that's enough for a school project:
- [Aiven](https://aiven.io) (free MySQL plan)
- [Clever Cloud](https://www.clever-cloud.com) (free small MySQL add-on)
- [db4free.net](https://www.db4free.net) (free, simplest signup, fine for demos — not for real user data at scale)

Once created, run `setup.sql` against it (most of these give you a web SQL console, or use MySQL Workbench / phpMyAdmin) to create the `users` and `chats` tables.

**2. Push this folder to GitHub.**
Create a new repo and push `nexus/` to it. Don't commit your real `.env` — only `.env.example` should go in git (your `.gitignore` already excludes `.env`).

**3. Deploy on Render (free web service).**
- [render.com](https://render.com) → New → Web Service → connect your GitHub repo.
- Build command: `npm install`
- Start command: `node server.js`
- Add environment variables (from step 1's DB): `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. Leave `PORT` alone — Render sets it automatically and your code already reads `process.env.PORT`.
- Deploy. You'll get a URL like `https://nexus-xxxx.onrender.com`.

*Note: Render's free tier sleeps after ~15 min of no traffic, so the first visit after a while takes 30–50 seconds to wake up — normal for free hosting, not a bug.*

**Alternative if you'd rather not touch a database at all:** [Railway](https://railway.app) or [Cyclic](https://www.cyclic.sh) both offer a free Node + MySQL bundle in one place, which saves you the "two separate services" step above.

## 4. Make the QR code
Once you have your live URL, go to a free generator like [qr-code-generator.com](https://www.qr-code-generator.com) or [Google's built-in one via search "qr code generator"] — paste your Render URL, download the PNG. Anyone who scans it opens the live site directly, on phone or tablet, and it'll lay out correctly thanks to the responsive fixes above.

## A couple of things worth knowing
- The report page's "Ask Nexus" chatbot uses a third-party embed (Chatbase) — that's already wired up from your original file, just confirm the bot script ID (`SpKauJzdvsmA4Dry1EXNo`) is still yours before sharing publicly.
- Login only accepts `@gmail.com` addresses right now (see `server.js`) — worth knowing if classmates try to sign up with a school email.
- Quiz results (MBTI type, stress score, IQ score) are stored in the browser's `localStorage`, so they're per-device, not synced to an account — fine for a demo, just not "my results follow me to a new phone."
