const Notification = require("../models/notification.model");
const { handleError, handleResponse } = require("../utils/common-functions");

// Get all unread notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch unread notifications for the user
    const notifications = await Notification.find({ userId });

    // Return success response with the list of notifications
    return handleResponse(
      res,
      200,
      "Notifications fetched successfully",
      notifications
    );
  } catch (error) {
    // Handle error and return error response
    handleError(res, "Error fetching notifications", error);
  }
};

// Add a new notification
const addNotification = async (req, res) => {
  try {
    const { userId, title, type, createdAt } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const newNotification = new Notification({
      userId, // Make sure the assigned user's ID is saved
      message: title,
      type,
      createdAt,
    });

    await newNotification.save();

    res
      .status(201)
      .json({ success: true, message: "Notification saved successfully!" });
  } catch (error) {
    console.error("Error saving notification:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Delete a notification by ID
const deleteNotifications = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the notification
    const notification = await Notification.findByIdAndDelete(id);

    // If notification not found, return error
    if (!notification) {
      return handleResponse(res, 404, "Notification not found");
    }

    // Return success response for notification deletion
    return handleResponse(res, 200, "Notification deleted successfully");
  } catch (error) {
    // Handle error and return error response
    handleError(res, "Error deleting notification", error);
  }
};

module.exports = { getNotifications, addNotification, deleteNotifications };
