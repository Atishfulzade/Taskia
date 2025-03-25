const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "error"], default: "info" }, // Enum for type
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }, // Correct boolean field
  },
  { timestamps: true },
  { _id: false } // This prevents Mongoose from auto-generating an ID for each notification
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    notifications: [notificationSchema], // Embedding notification schema

    location: { type: String },
    contact: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
