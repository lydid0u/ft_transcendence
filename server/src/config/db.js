const sqlite3 = require('sqlite3').verbose();

// Create database connection
const db = new sqlite3.Database('/app/data/database.sqlite');

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

console.log('Database initialized');

module.exports = db;