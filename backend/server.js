// backend/server.js
// This is the main file that starts our backend server

const express    = require("express");
const mongoose   = require("mongoose");
const dotenv     = require("dotenv");
const cors       = require("cors");

// Load variables from .env file
dotenv.config();

const app = express();

// ── Middleware ──────────────────────────────────────────
// Middleware = code that runs on every request before it hits the route

// Allows React frontend (localhost:5173) to talk to this backend (localhost:5000)
app.use(cors());

// Lets express read JSON from request body
// Without this, req.body would be undefined
app.use(express.json());

// ── Routes ──────────────────────────────────────────────
// Connect route files — each file handles one topic
const authRoutes      = require("./routes/auth");
const medicineRoutes  = require("./routes/medicines");
const taskRoutes      = require("./routes/tasks");

// Any request starting with /api/auth goes to routes/auth.js
app.use("/api/auth",      authRoutes);
// Any request starting with /api/medicines goes to routes/medicines.js
app.use("/api/medicines", medicineRoutes);
// Any request starting with /api/tasks goes to routes/tasks.js
app.use("/api/tasks",     taskRoutes);

// ── Test route ──────────────────────────────────────────
// Visit http://localhost:5000/ to check if server is running
app.get("/", (req, res) => {
  res.json({ message: "CareSync backend is running" });
});

// ── MongoDB Connection ───────────────────────────────────
// Connect to MongoDB first, then start the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    // Only start server after DB is connected
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err.message);
  });