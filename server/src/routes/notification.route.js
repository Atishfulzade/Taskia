const express = require("express");
const router = express.Router();
const {
  getNotifications,
  addNotification,
  deleteNotifications,
} = require("../controllers/notification.controller.js");
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");

// Get all notifications for the logged-in user
router.post("/get", verifyUser, getNotifications);

// Add a new notification
router.post("/add", verifyUser, addNotification);

// Delete a notification by ID
router.post("/delete/:id", verifyUser, deleteNotifications);

module.exports = router;
