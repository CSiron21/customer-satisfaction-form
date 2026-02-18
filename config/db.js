const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password', // Default, should be changed in .env
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const DB_NAME = process.env.DB_NAME || 'customer_satisfaction';

async function initializeDatabase() {
    let connection;
    try {
        // Connect without database selected to create it
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        console.log(`[DB] Connected to MySQL server at ${dbConfig.host}`);

        // Create Database
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`[DB] Database '${DB_NAME}' checked/created.`);

        await connection.end();

        // Connect to the specific database
        const pool = mysql.createPool({
            ...dbConfig,
            database: DB_NAME
        });

        // Create Tables
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

module.exports = { initializeDatabase };
