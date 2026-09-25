import express from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";
import { asyncHandler, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const publicDirectory = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "public"
);

app.use(express.json());
app.use(express.static(publicDirectory));
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDirectory, "index.html"));
});

app.post(
  "/api/auth/register",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      const err = new Error("Username and password are required.");
      err.statusCode = 400;
      throw err;
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (existingUser.rows.length > 0) {
      const err = new Error("Username is already taken.");
      err.statusCode = 409;
      throw err;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at",
      [username, hashedPassword]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  })
);

//Login
app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      const err = new Error("Username and password required");
      err.statusCode = 400;
      throw err;
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];

    if (!user) {
      const err = new Error("Invalid username or password.");
      err.statusCode = 401;
      throw err;
    }

    //Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error("Invalid username or password.");
      err.statusCode = 401;
      throw err;
    }

    res.json({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });
  })
);

//Daily Logs
app.get(
  "/api/logs",
  asyncHandler(async (req, res) => {
    const userId = req.query.userId;
    if (!userId) {
      const err = new Error("userId query parameter is required.");
      err.statusCode = 400;
      throw err;
    }

    const { rows } = await pool.query(
      "SELECT * FROM logs WHERE user_id= $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  })
);

//Create a New Log
app.post(
  "/api/logs",
  asyncHandler(async (req, res) => {
    const { userId, title, category, content } = req.body;

    if (!userId || !title || !category || !content) {
      const err = new Error(
        "userId, title category, and content are required."
      );
      err.statusCode = 400;
      throw err;
    }

    const { rows } = await pool.query(
      "INSERT INTO logs (user_id, title, category, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, title, category, content]
    );

    res.status(201).json(rows[0]);
  })
);

//Modify existing log
app.put(
  "/api/logs/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { userId, title, category, content } = req.body;

    if (!userId || !title || !category || !content) {
      const err = new Error(
        "userId, title, category, and content are required."
      );
      err.statusCode = 400;
      throw err;
    }

    const { rows } = await pool.query(
      "UPDATE logs SET title =$1, category= $2, content=$3 WHERE id = $4 AND user_id =$5 RETURNING *",
      [title, category, content, id, userId]
    );

    if (rows.length === 0) {
      const err = new Error("Log entry not found or unauthorized.");
      err.statusCode = 404;
      throw err;
    }
    res.json(rows[0]);
  })
);

//Remove a log
app.delete(
  "/api/logs/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.query.userId;

    if (!userId) {
      const err = new Error("userId query parameter is required.");
      err.statusCode = 400;
      throw err;
    }

    const { rowCount } = await pool.query(
      "DELETE FROM logs WHERE id = $1 AND user_id =$2",
      [id, userId]
    );

    if (rowCount === 0) {
      const err = new Error("Log entry not found or unauthorized.");
      err.statusCode = 404;
      throw err;
    }

    res.json({ message: "Log deleted successfully" });
  })
);

app.use(errorHandler);

if (!process.env.VERCEL) {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost: ${PORT}`)
  );
}

export default app;
