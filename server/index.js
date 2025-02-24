const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
require("dotenv").config();
const { connect } = require("./src/db/conn.js");
const routes = require("./src/routes/index.js");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

connect();

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
