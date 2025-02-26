const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();
const { connect } = require("./src/db/conn.js");
const routes = require("./src/routes/index.js");
const session = require("express-session");

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

connect();
app.use(
  session({
    secret: process.env.SESSION_SECRET, // A secret key for signing the session ID cookie
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Ensure cookie is only sent over HTTPS in production
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
// Default Route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Task management API!" });
});

// Main routes
app.use("/api/v1", routes);

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
