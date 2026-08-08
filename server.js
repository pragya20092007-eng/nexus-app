const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Serve the frontend (index.html, login.html, mbti.html, etc.) from /public
// This means ONE deployed service handles both the pages and the API,
// so the pages can call fetch('/api/...') without worrying about the domain.
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

db.connect(err => {
    if (err) console.error('Database connection failed:', err.stack);
    else console.log('Connected to MySQL database.');
});

// SIGNUP: Save user to MySQL
app.post('/api/signup', async (req, res) => {
    const { fullname, email, password } = req.body;
    
    try {
        // Hash password with bcryptjs
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)';
        db.query(query, [fullname, email, hashedPassword], (err) => {
            if (err) return res.status(500).json({ message: "Email already registered!" });
            res.json({ message: "Success" });
        });
    } catch (error) {
        res.status(500).json({ message: "Error hashing password." });
    }
});

// LOGIN: Validates Gmail ID and Account existence
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email.endsWith("@gmail.com")) {
        return res.status(400).json({ message: "Only Gmail IDs are allowed." });
    }

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ message: "Database error." });
        if (results.length === 0) {
            return res.status(404).json({ message: "Account not found. Please Sign Up first." });
        }
        
        const user = results[0];
        try {
            // Compare hashed password using bcryptjs
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Incorrect password." });
            }

            res.json({ name: user.fullname, pic: user.profile_pic });
        } catch (error) {
            res.status(500).json({ message: "Error validating password." });
        }
    });
});

// SAVE CHAT: Saves messages to MySQL
app.post('/api/save-chat', (req, res) => {
    const { email, message, sender } = req.body;
    const query = 'INSERT INTO chats (user_email, message, sender) VALUES (?, ?, ?)';
    db.query(query, [email, message, sender], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Saved to MySQL!");
    });
});

// LOGOUT: Logs out user
app.post('/api/logout', (req, res) => {
    // Client should clear localStorage on their end
    // This endpoint can be used for server-side cleanup if needed
    res.json({ message: "Logged out successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));