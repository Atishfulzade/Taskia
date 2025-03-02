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

const deleteNotifications = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    handleError(res, "Error deleting notification", error);
  }
};

module.exports = { getNotifications, deleteNotifications };
