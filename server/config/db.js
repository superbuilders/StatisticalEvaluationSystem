const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Ensure correct path if .env is in root

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Optional: Use connection string if provided
  // connectionString: process.env.DATABASE_URL,
  // ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Add SSL for remote DBs if using URL
});

// Test connection on startup (handled in server.js)

module.exports = {
  query: (text, params) => pool.query(text, params),
  // You can add a method to get a client from the pool for transactions
  getClient: () => pool.connect(),
}; 