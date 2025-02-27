const mongoose = require("mongoose");
require("dotenv").config();
// Read environment variables
const mongoUri = process.env.MONGO_URI;
const database = process.env.DATABASE;
const url = `${mongoUri}${database}`;

// Enable strictQuery mode (prevents unwanted queries)
mongoose.set("strictQuery", true);

async function connect() {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connection successful");

    // Handle MongoDB connection events
    mongoose.connection.on("connected", () => {
      console.log("🟢 MongoDB connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("🛑 MongoDB disconnected");
    });

    // Handle process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔴 MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Exit the process if the connection fails
  }
}

module.exports = { connect };
