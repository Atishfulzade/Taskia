const Task = require("../models/task.model.js");

// Middleware to check task permissions
const checkTaskAccess = async (req, res, next) => {
  const { taskId } = req.params;
  const { permission } = req.query; // 'view' or 'edit'

  try {
    const task = await Task.findOne({
      customId: taskId,
      $or: [
        { "shareLinks.link": `${process.env.CLIENT_URL}/task/${taskId}` },
        { "collaborators.email": req.user?.email },
      ],
    });

    if (!task) return res.status(404).send("Task not found");

    // Check if link has sufficient permissions
    const shareLink = task.shareLinks.find(
      (link) => link.link === `${process.env.CLIENT_URL}/task/${taskId}`
    );

    if (shareLink && shareLink.permission === "view" && permission === "edit") {
      return res.status(403).send("Insufficient permissions");
    }

    req.task = task;
    next();
  } catch (error) {
    res.status(500).send("Server error");
  }
};
module.exports = checkTaskAccess;
