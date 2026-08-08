
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
    ssl: { rejectUnauthorized: true }
});

db.connect(err => {
    if (err) console.error('Database connection failed:', err.stack);
    else console.log('Connected to MySQL database.');
});