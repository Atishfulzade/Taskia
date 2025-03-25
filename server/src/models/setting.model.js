const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  theme: {
    type: String,
    enum: ["light", "dark", "system"],
    default: "system",
  },
  fontSize: {
    type: String,
    enum: ["small", "medium", "large"],
    default: "medium",
  },
  notifications: {
    email: {
      type: Boolean,
      default: false,
    },
    push: {
      type: Boolean,
      default: true,
    },
    marketing: {
      type: Boolean,
      default: false,
    },
  },
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
    sessionTimeout: {
      type: String,
      default: "1 hour",
    },
  },
  useCustomId: { type: Boolean, default: true },
});
const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;
