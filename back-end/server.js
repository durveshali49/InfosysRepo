import express from "express";
import cors from "cors";
import pool from "./Service.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection (optional - won't crash if DB is down)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");
    connection.release();
  } catch (err) {
    console.log("⚠️  Database connection failed:", err.message);
    console.log("🔧 Server will run without database connection");
  }
})();

// Basic routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Local Services Finder API is running!",
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    server: "running",
    timestamp: new Date().toISOString() 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API endpoint: http://localhost:${PORT}/`);
});
