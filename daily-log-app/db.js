import pg from "pg";
import dotenv from "dotenv";

dontev.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnathorized: false,
  },
});

pool.query("SELECT NOW ()", (err, res) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Connected to Neon PostgreSQL:", res.rows[0].now);
  }
});
