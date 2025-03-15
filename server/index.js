const express = require("express");
const cors = require("cors");
const session = require("express-session");
const http = require("http");
const dotenv = require("dotenv");
const { connect } = require("./src/db/conn.js");
const routes = require("./src/routes/index.js");
const socketIo = require("socket.io");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const Project = require("./src/models/project.model.js");
const { log } = require("console");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.set("trust proxy", 1);

// Session Middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "your_secret_key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: `${process.env.MONGO_URI}${process.env.DATABASE}`,
    ttl: 14 * 24 * 60 * 60, // 14 days
    collectionName: "sessions",
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(sessionMiddleware);

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

// Custom rate limiter middleware
const rateLimit = (windowMs, max) => {
  const eventCounts = new Map(); // Store event counts per socket

  return (socket, next) => {
    const now = Date.now();
    const socketId = socket.id;

    // Initialize event count for the socket
    if (!eventCounts.has(socketId)) {
      eventCounts.set(socketId, { count: 0, lastReset: now });
    }

    const socketData = eventCounts.get(socketId);

    // Reset the count if the time window has passed
    if (now - socketData.lastReset > windowMs) {
      socketData.count = 0;
      socketData.lastReset = now;
    }

    // Increment the event count
    socketData.count += 1;

    // Check if the event count exceeds the limit
    if (socketData.count > max) {
      console.log(`⚠️ Rate limit exceeded for socket ${socketId}`);
      socket.disconnect(true); // Disconnect the socket
      return;
    }

    next(); // Allow the event
  };
};

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Important for session sharing
  },
});
app.set("io", io);

// Apply rate limiter middleware
io.use(rateLimit(60 * 1000, 100)); // Allow 100 events per minute per socket

// Wrap session middleware for use with WebSockets
// Wrap session middleware for use with WebSockets
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, (err) => {
    if (err) {
      console.error("Session middleware error:", err);
      return next(err);
    }

    next();
  });
});

io.on("connection", async (socket) => {
  console.log("🔌 New socket connection:", socket.id);

  const userId = socket.request.session.userId;
  if (!userId) {
    console.log("❌ Unauthenticated user attempted to connect");
    socket.disconnect(true);
    return;
  }

  console.log(`🔌 Authenticated user connected: ${userId}`);

  // Join user-specific room
  socket.on("joinUserRoom", async (userId) => {
    console.log(`joinUserRoom event received for userId: ${userId}`); // Debugging
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid userId:", userId);
      return;
    }

    try {
      socket.join(userId.toString());
      console.log(`📌 User ${userId} joined their personal room`);

      const projects = await Project.find({
        $or: [{ userId }, { member: userId }],
      });

      projects.forEach((project) => {
        socket.join(project._id.toString());
        console.log(`📌 User ${userId} joined project room ${project._id}`);
      });
    } catch (error) {
      console.error("Error joining rooms:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });
});

// Graceful Shutdown
const gracefulShutdown = () => {
  console.log("🔴 Shutting down server...");
  io.close(() => {
    console.log("🛑 WebSocket server closed.");
    server.close(() => {
      console.log("✅ HTTP server closed.");
      process.exit(0);
    });
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start Server
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
