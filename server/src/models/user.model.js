const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: String,
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
    notifications: [
      {
        message: { type: String, required: true },
        type: { type: String, default: "info" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
