const Notification = require("../models/Notification");
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
    const { title, type, timestamp } = req.body;
    const userId = req.user.id;

    // Check if the notification already exists
    const existingNotification = await Notification.findOne({
      title,
      type,
      timestamp,
      userId,
    });
    if (existingNotification) {
      return handleResponse(res, 400, "Notification already exists");
    }

    // Create a new notification
    const newNotification = new Notification({
      title,
      type,
      timestamp,
      userId,
    });

    // Save the new notification
    await newNotification.save();

    // Return success response for notification creation
    return handleResponse(
      res,
      200,
      "Notification created successfully",
      newNotification
    );
  } catch (error) {
    // Handle error and return error response
    handleError(res, "Error creating notification", error);
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
