
require("dotenv").config();
const { Pool } = require("pg");

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

db.on("error", (err) => {
    console.error("Unexpected database error:", err.message);
});

module.exports = db;
