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

// Load environment variables
dotenv.config();

if (
  !process.env.MONGO_URI ||
  !process.env.DATABASE ||
  !process.env.SESSION_SECRET
) {
  console.error("❌ Missing required environment variables. Check .env file.");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;
app.set("trust proxy", 1);

// Session Middleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
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

// Middleware setup
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

// Connect to Database
connect().catch((err) => {
  console.error("❌ Database connection error:", err);
  process.exit(1);
});

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Default Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Task Management API!" });
});

// API Routes
app.use("/api/v1", routes);

// HTTP Server setup
const server = http.createServer(app);

// Socket.IO setup
// Socket setup in server.js file
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});
app.set("io", io); // Make Socket.IO instance accessible in controllers

// Use session middleware with Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

io.on("connection", async (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  try {
    const session = socket.request.session;
    const userId = session?.userId;

    if (!userId) {
      console.log(
        "No user session found, proceeding with limited functionality"
      );
    } else {
      console.log(`✅ User connected: ${userId}`);

      // User joins their own room for personal notifications
      socket.join(userId);
      console.log(`📌 User ${userId} joined their personal room.`);
    }

    // Emit test connection event
    socket.emit("testConnection", {
      message: "WebSocket connected successfully!",
      socketId: socket.id,
    });

    // Join project rooms - both owned and member projects
    socket.on("joinProjectRooms", async (userId) => {
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error("❌ Invalid userId:", userId);
        return;
      }

      try {
        // Find projects where user is owner or member
        const userProjects = await Project.find({
          $or: [{ userId }, { member: userId }],
        });

        console.log(`Found ${userProjects.length} projects for user ${userId}`);

        // Join each project room
        userProjects.forEach((project) => {
          const projectRoomId = `project:${project._id.toString()}`;
          socket.join(projectRoomId);
          console.log(`📌 User ${userId} joined project room ${projectRoomId}`);
        });

        // Notify client that they've joined all rooms
        socket.emit("joinedRooms", {
          message: `Joined ${userProjects.length} project rooms`,
          count: userProjects.length,
        });
      } catch (error) {
        console.error("❌ Error joining project rooms:", error);
        socket.emit("error", { message: "Failed to join project rooms" });
      }
    });

    // Join a specific project room
    socket.on("joinRoom", ({ roomId }) => {
      if (!roomId) {
        console.error("❌ Invalid room ID");
        return;
      }

      socket.join(roomId);
      console.log(`📌 Socket ${socket.id} joined room: ${roomId}`);
    });

    // Leave a specific project room
    socket.on("leaveRoom", ({ roomId }) => {
      if (!roomId) {
        console.error("❌ Invalid room ID");
        return;
      }

      socket.leave(roomId);
      console.log(`📌 Socket ${socket.id} left room: ${roomId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  } catch (error) {
    console.error("❌ WebSocket connection error:", error);
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("🔴 Server shutting down...");
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

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
