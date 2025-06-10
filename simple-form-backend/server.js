// server.js

// 1. Import necessary modules
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// 2. Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Apply Middleware
app.use(cors());
app.use(express.json());

// 4. Database Connection Setup
const connectionString =
  "postgresql://postgres.rfzzyphbopceiloyiajz:Fuentes-085242@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString: connectionString,
  // Recommended settings for Supabase pooler to avoid idle connection errors
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
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
  // **ROBUST PATTERN START**
  const client = await pool.connect(); // Get a client from the pool
  try {
    await client.query(queryText);
    console.log('"submissions" table is ready.');
  } catch (err) {
    console.error("Error creating table:", err.stack);
  } finally {
    client.release(); // Always release the client back to the pool
  }
  // **ROBUST PATTERN END**
};

// 6. Define API Endpoints (with robust connection handling)

// GET endpoint
app.get("/api/submissions", async (req, res) => {
  console.log("GET /api/submissions - Fetching from database...");
  const client = await pool.connect(); // Get a client from the pool
  try {
    const result = await client.query(
      "SELECT * FROM submissions ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error fetching submissions" });
  } finally {
    client.release(); // ALWAYS release the client back to the pool
  }
});

// POST endpoint
app.post("/api/submissions", async (req, res) => {
  const { username, email, phone } = req.body;
  if (!username || !email || !phone) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const queryText =
    "INSERT INTO submissions(username, email, phone) VALUES($1, $2, $3) RETURNING *";
  const values = [username, email, phone];

  const client = await pool.connect(); // Get a client from the pool
  try {
    const result = await client.query(queryText, values);
    const newSubmission = result.rows[0];
    console.log("POST /api/submissions - New submission added:", newSubmission);
    res.status(201).json(newSubmission);
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error saving submission" });
  } finally {
    client.release(); // ALWAYS release the client back to the pool
  }
});

// DELETE endpoint
app.delete("/api/submissions/:id", async (req, res) => {
  const idToDelete = parseInt(req.params.id, 10);
  const queryText = "DELETE FROM submissions WHERE id = $1 RETURNING *";

  const client = await pool.connect(); // Get a client from the pool
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
    client.release(); // ALWAYS release the client back to the pool
  }
});

// PUT endpoint
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

  const client = await pool.connect(); // Get a client from the pool
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
    client.release(); // ALWAYS release the client back to the pool
  }
});

// 7. Start the HTTP server and create the table if it doesn't exist
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
  createTable();
});
