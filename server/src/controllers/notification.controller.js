const Notification = require("../models/Notification");
const { handleError } = require("../utils/common-functions");
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
      isRead: false,
    });
    res.status(200).json(notifications);
  } catch (error) {
    handleError(res, "Error fetching notifications", error);
  }
};

module.exports = { getNotifications }; // Export using module.exports
