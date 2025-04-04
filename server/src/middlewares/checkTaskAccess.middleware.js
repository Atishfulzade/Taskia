const Task = require("../models/task.model.js");
const Project = require("../models/project.model.js"); // Import Project model

// Middleware to check task permissions
const checkTaskAccess = async (req, res, next) => {
  const { taskId } = req.params;
  const { permission } = req.query; // 'view' or 'edit'

  try {
    // First check if this is a shared link access
    const task = await Task.findOne({
      customId: taskId,
      $or: [
        {
          "shareLinks.link": `${process.env.CLIENT_URL}/task/${taskId}`,
          "shareLinks.isActive": true,
          "shareLinks.expiresAt": { $gt: new Date() },
        },
        { "collaborators.email": req.user?.email },
      ],
    }).populate("status");

    if (!task) return res.status(404).send("Task not found or link expired");

    // Check if link has sufficient permissions
    if (!req.user) {
      // For unauthenticated users, check share link permissions
      const shareLink = task.shareLinks.find(
        (link) =>
          link.link === `${process.env.CLIENT_URL}/task/${taskId}` &&
          link.isActive
      );

      if (!shareLink) {
        return res.status(404).send("Share link not found or expired");
      }

      if (shareLink.permission === "view" && permission === "edit") {
        return res.status(403).send("Insufficient permissions");
      }
    } else {
      // For authenticated users, check if they have direct access
      const project = await Project.findById(task.projectId);
      const isProjectMember =
        project.userId.toString() === req.user.id ||
        project.member.some((m) => m.toString() === req.user.id);
      const isTaskAssignee =
        task.assignedTo && task.assignedTo.toString() === req.user.id;
      const isCollaborator = task.collaborators.some(
        (c) => c.email === req.user.email
      );

      // If user is a collaborator, check their permission level
      if (isCollaborator && !isProjectMember && !isTaskAssignee) {
        const collaborator = task.collaborators.find(
          (c) => c.email === req.user.email
        );
        if (collaborator.permission === "view" && permission === "edit") {
          return res.status(403).send("Insufficient permissions");
        }
      }

      if (!isProjectMember && !isTaskAssignee && !isCollaborator) {
        return res.status(403).send("You don't have access to this task");
      }
    }

    req.task = task;
    req.accessLevel = permission;
    next();
  } catch (error) {
    console.error("Error checking task access:", error);
    res.status(500).send("Server error");
  }
};

module.exports = checkTaskAccess;
