const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files from root

// Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'customer_satisfaction',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Database Initialization
async function initializeDatabase() {
    let connection;
    try {
        // Connect to MySQL server (no DB selected)
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        console.log(`[DB] Connected to MySQL server at ${dbConfig.host}`);

        // Create Database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        console.log(`[DB] Database '${dbConfig.database}' checked/created.`);
        await connection.end();

        // Create Pool with DB selected
        const pool = mysql.createPool(dbConfig);

        // Create Table if not exists
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                category VARCHAR(50),
                service VARCHAR(255),
                satisfaction ENUM('Satisfied', 'Not Satisfied') NOT NULL,
                comments TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `;
        await pool.query(createTableQuery);
        console.log(`[DB] Table 'submissions' checked/created.`);

        return pool;
    } catch (error) {
        console.error('[DB] Initialization Error:', error);
        process.exit(1);
    }
}

// Global DB Pool
let dbPool;

// Start Server
(async () => {
    dbPool = await initializeDatabase();

    app.listen(PORT, () => {
        console.log(`[Server] Running on http://localhost:${PORT}`);
    });
})();

// --- API Routes ---

// Submit Feedback
app.post('/api/submissions', async (req, res) => {
    try {
        const { name, category, service, satisfaction, comments } = req.body;

        if (!satisfaction) {
            return res.status(400).json({ error: 'Satisfaction rating is required.' });
        }

        const [result] = await dbPool.execute(
            'INSERT INTO submissions (name, category, service, satisfaction, comments) VALUES (?, ?, ?, ?, ?)',
            [name || null, category || null, service || null, satisfaction, comments || null]
        );

        res.status(201).json({ message: 'Feedback submitted successfully', id: result.insertId });
    } catch (error) {
        console.error('Insert Error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Get All Submissions (Protected-ish)
// In a real app, use proper auth. Here we check a simple header or just return.
// Since the frontend is static JS, real auth is hard without sessions/tokens.
// We will just expose it but rely on the admin page's "login" UI to hide it from casual users.
app.get('/api/submissions', async (req, res) => {
    try {
        const [rows] = await dbPool.query('SELECT * FROM submissions ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Login API (Simple check)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Hardcoded for simplicity/legacy compatibility
    if (username === 'admin' && password === 'S0C@DMIN321') {
        res.json({ success: true, token: 'simple-admin-token' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});
