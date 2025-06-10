// server.js

// 1. Import necessary modules
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// 2. Initialize the Express application
const app = express();
// *** PRODUCTION CHANGE: Use the PORT from environment variables, with 5000 as a fallback for local dev ***
const PORT = process.env.PORT || 5000;

// 3. Apply Middleware
app.use(cors());
app.use(express.json());

// 4. *** PRODUCTION CHANGE: Use the DATABASE_URL from environment variables ***
// This is the most important change. We are no longer hardcoding the database connection string.
// Render will provide the value for `process.env.DATABASE_URL` that you set in the dashboard.
// If it's not found, it will fall back to your local dev string (replace if needed).
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.rfzzyphbopceiloyiajz:Fuentes-085242@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString: connectionString,
  // Add SSL configuration for production deployments (like on Render)
  // This is often required for secure connections to cloud databases.
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// 5. Function to Create Table on Startup
const createTable = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const client = await pool.connect();
  try {
    await client.query(queryText);
    console.log('"submissions" table is ready.');
  } catch (err) {
    console.error("Error creating table:", err.stack);
  } finally {
    client.release();
  }
};

// 6. Define API Endpoints (These remain the same)
app.get("/api/submissions", async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM submissions ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching submissions" });
  } finally {
    client.release();
  }
});

app.post("/api/submissions", async (req, res) => {
  const { username, email, phone } = req.body;
  if (!username || !email || !phone) {
    return res.status(400).json({ message: "All fields are required." });
  }
  const queryText =
    "INSERT INTO submissions(username, email, phone) VALUES($1, $2, $3) RETURNING *";
  const values = [username, email, phone];
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error saving submission" });
  } finally {
    client.release();
  }
});

app.delete("/api/submissions/:id", async (req, res) => {
  const idToDelete = parseInt(req.params.id, 10);
  const queryText = "DELETE FROM submissions WHERE id = $1";
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, [idToDelete]);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: `Submission with id ${idToDelete} not found.` });
    }
    res
      .status(200)
      .json({
        message: `Submission with id ${idToDelete} successfully deleted.`,
      });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error deleting submission" });
  } finally {
    client.release();
  }
});

app.put("/api/submissions/:id", async (req, res) => {
  const idToUpdate = parseInt(req.params.id, 10);
  const { username, email, phone } = req.body;
  if (!username || !email || !phone) {
    return res
      .status(400)
      .json({ message: "All fields are required for update." });
  }
  const queryText =
    "UPDATE submissions SET username = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *";
  const values = [username, email, phone, idToUpdate];
  const client = await pool.connect();
  try {
    const result = await client.query(queryText, values);
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: `Submission with id ${idToUpdate} not found.` });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error executing update query", err.stack);
    res.status(500).json({ message: "Error updating submission" });
  } finally {
    client.release();
  }
});

// 7. Start the HTTP server
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  createTable();
});
