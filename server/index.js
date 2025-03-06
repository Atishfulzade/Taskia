const express = require("express");
const cors = require("cors");
const session = require("express-session");
const http = require("http");
const dotenv = require("dotenv");
const { connect } = require("./src/db/conn.js");
const routes = require("./src/routes/index.js");
const socketIo = require("socket.io");
const MongoStore = require("connect-mongo");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Enable cookies and authentication
  })
);
app.use(express.json()); // JSON body parser

// Session Middleware (Fixed: Only one session middleware)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `${process.env.MONGO_URI}${process.env.MONGO_URI}`, // Your MongoDB connection string
      ttl: 14 * 24 * 60 * 60, // Session expiration in seconds (14 days)
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Ensure HTTPS in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    },
  })
);

// Database connection
connect();

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Default Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Task Management API!" });
});

// Main Routes
app.use("/api/v1", routes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Attach `io` to `app` for use in controllers
app.set("io", io);

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join user-specific room
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId.toString());
    console.log(`📌 User ${userId} joined room`, io.sockets.adapter.rooms);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Graceful Shutdown (SIGINT, SIGTERM)
process.on("SIGINT", () => {
  console.log("🔴 Shutting down server...");
  io.close(() => {
    console.log("🛑 WebSocket server closed.");
    server.close(() => {
      console.log("✅ HTTP server closed.");
      process.exit(0);
    });
  });
});

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
