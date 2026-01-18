const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require("./routes/auth.routes");
const donationRoutes = require("./routes/donation.routes");
const requestRoutes = require("./routes/request.routes");

const app = express();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
        mediaSrc: ["'self'", "data:", "blob:"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
); // Security headers with CORS support for resources
app.use(morgan("dev")); // Logging
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use(
  "/uploads",
  (req, res, next) => {
    console.log("📁 File request:", req.path);
    console.log("📍 Full URL:", req.originalUrl);
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// API route to serve files with proper headers
app.get("/api/files/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "uploads", filename);

  if (require("fs").existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({
      success: false,
      message: "File not found",
    });
  }
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/requests", requestRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "EduLink API is running",
    timestamp: new Date().toISOString(),
  });
});

// Debug: List uploaded files
app.get("/api/debug/uploads", (req, res) => {
  const fs = require("fs");
  const uploadsPath = path.join(__dirname, "uploads");

  try {
    const files = fs.readdirSync(uploadsPath);
    res.json({
      success: true,
      uploadPath: uploadsPath,
      files: files,
      count: files.length,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL}`);
});
