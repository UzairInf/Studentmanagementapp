
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Supabase connected!");
    console.log("Database time:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
