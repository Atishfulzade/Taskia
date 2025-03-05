const express = require("express");
const router = express.Router();
const {
  getNotifications,
  addNotification,
  deleteNotifications,
} = require("../controllers/notificationController");
const { authenticateUser } = require("../middleware/authMiddleware");

// Get all notifications for the logged-in user
router.post("/notifications", authenticateUser, getNotifications);

// Add a new notification
router.post("/notifications", authenticateUser, addNotification);

// Delete a notification by ID
router.post("/notifications/:id", authenticateUser, deleteNotifications);

module.exports = router;
