// server.js

// 1. Import necessary modules
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// 2. Initialize the Express application
const app = express();
const PORT = process.env.PORT || 5000;

// 3. *** PRODUCTION CORS CONFIGURATION ***
// Define the list of websites that are allowed to make requests to this API.
const allowedOrigins = [
  "http://localhost:5173", // Your local React development server
  "https://simple-form-web-app.netlify.app", // Your live Netlify frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Log the incoming origin for debugging purposes
    console.log("CORS CHECK: Request received from origin:", origin);

    // Check if the incoming request's origin is in our allowlist.
    // Also allow requests with no origin (like from Postman or server-side tools).
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

// Apply Middleware with the new CORS options
app.use(cors(corsOptions));
app.use(express.json());

// 4. Database Connection Setup
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.rfzzyphbopceiloyiajz:Fuentes-085242@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres";

const pool = new Pool({
  connectionString: connectionString,
  // Use a simplified SSL configuration that works reliably on Render
  ssl: {
    rejectUnauthorized: false,
  },
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

// 6. Define API Endpoints

// Add a root endpoint for health checks
app.get("/", (req, res) => {
  res.status(200).send("Backend server is alive and running!");
});

// GET endpoint to fetch all submissions from the database
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

// POST endpoint to add a new submission to the database
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

// DELETE endpoint to remove a submission from the database by ID
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
    res.status(200).json({
      message: `Submission with id ${idToDelete} successfully deleted.`,
    });
  } catch (err) {
    console.error("Error executing query", err.stack);
    res.status(500).json({ message: "Error deleting submission" });
  } finally {
    client.release();
  }
});

// PUT endpoint to update a submission in the database by ID
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

// 7. Start the HTTP server and create the table if it doesn't exist
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  createTable();
});
