const Notification = require("../models/Notification");
const { handleError, handleResponse } = require("../utils/common-functions");

// Get all unread notifications for the logged-in user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch unread notifications for the user
    const notifications = await Notification.find({
      userId,
      isRead: false,
    });

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

module.exports = { getNotifications, deleteNotifications };
