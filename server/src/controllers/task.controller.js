const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;
const User = require("../models/user.model.js");
const Project = require("../models/project.model.js");
const Task = require("../models/task.model.js");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const msg = require("../utils/message-constant.json");
const { generateUniqueId } = require("../utils/generateUniqueId.js");

// Helper Functions
const validateTaskInput = (title, projectId, status) => {
  if (!title || !projectId || !status) {
    return { isValid: false, error: msg.task.allFieldsRequired };
  }
  if (!isValidObjectId(projectId)) {
    return { isValid: false, error: msg.task.invalidProjectId };
  }
  return { isValid: true };
};

const validateAssignee = async (assignedTo) => {
  if (assignedTo && isValidObjectId(assignedTo)) {
    const userExists = await User.findById(assignedTo);
    if (!userExists) return { isValid: false, error: msg.user.userNotExists };
    return { isValid: true, validAssignedTo: assignedTo };
  }
  return { isValid: true, validAssignedTo: null };
};

const notifyTaskAssignment = (io, task, projectId, assignedTo) => {
  if (!io) {
    console.error("Socket instance not available");
    return;
  }

  const projectRoomId = `project:${projectId}`;

  if (assignedTo) {
    io.to(assignedTo.toString()).emit("taskAssigned", {
      message: `A new task "${task.title}" has been assigned to you.`,
      task,
    });
  }

  io.to(projectRoomId).emit("taskCreated", {
    message: `A new task "${task.title}" has been created.`,
    task,
  });
};

// Controller Methods
const taskController = {
  async addTask(req, res) {
    try {
      const { title, projectId, status, assignedTo, useCustomId, ...others } =
        req.body.data;

      // Validate input
      const { isValid, error } = validateTaskInput(title, projectId, status);
      if (!isValid) return handleResponse(res, 400, error);

      // Check project existence
      const project = await Project.findById(projectId);
      if (!project)
        return handleResponse(res, 404, msg.project.projectNotFound);

      // Check duplicate task
      const existingTask = await Task.findOne({ title, projectId });
      if (existingTask) {
        return handleResponse(res, 400, msg.task.taskTitleAlreadyExists);
      }

      // Validate assignee
      const {
        isValid: isAssigneeValid,
        error: assigneeError,
        validAssignedTo,
      } = await validateAssignee(assignedTo);
      if (!isAssigneeValid) return handleResponse(res, 400, assigneeError);

      // Prepare task data
      const taskData = {
        title,
        projectId,
        assignedTo: validAssignedTo,
        status,
        ...others,
      };

      // Generate custom ID if needed
      if (useCustomId) {
        taskData.customId = await generateUniqueId({
          type: "task",
          name: title,
          projectInitials: project.customId?.split("-")[0] || "TASK",
        });
      }

      // Create and save task
      const newTask = await new Task(taskData).save();

      // Notify relevant users
      notifyTaskAssignment(
        req.app.get("io"),
        newTask,
        projectId,
        validAssignedTo
      );

      return handleResponse(
        res,
        200,
        msg.task.taskCreatedSuccessfully,
        newTask
      );
    } catch (error) {
      console.error("Error creating task:", error);
      handleError(res, msg.task.errorCreatingTask, error);
    }
  },

  async updateTask(req, res) {
    try {
      const { id: taskId } = req.params;
      const { assignedTo, ...updateData } = req.body;

      // Validate task ID
      if (!isValidObjectId(taskId)) {
        return handleResponse(res, 400, msg.task.invalidTaskId);
      }

      // Get original task
      const originalTask = await Task.findById(taskId);
      if (!originalTask) return handleResponse(res, 404, msg.task.taskNotFound);

      // Update task
      const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
        new: true,
      });

      // Handle notifications if assignee changed
      const io = req.app.get("io");
      if (
        io &&
        assignedTo &&
        assignedTo !== originalTask.assignedTo?.toString()
      ) {
        const projectRoomId = `project:${updatedTask.projectId}`;

        io.to(assignedTo).emit("taskAssigned", {
          message: `Task "${updatedTask.title}" has been assigned to you.`,
          task: updatedTask,
        });

        io.to(projectRoomId).emit("taskUpdated", {
          message: `Task "${updatedTask.title}" has been updated.`,
          task: updatedTask,
        });
      }

      return handleResponse(
        res,
        200,
        msg.task.taskUpdatedSuccessfully,
        updatedTask
      );
    } catch (error) {
      handleError(res, msg.task.errorUpdatingTask, error);
    }
  },

  async deleteTask(req, res) {
    try {
      const { id: taskId } = req.params;

      if (!isValidObjectId(taskId)) {
        return handleResponse(res, 400, msg.task.invalidTaskId);
      }

      const task = await Task.findById(taskId);
      if (!task) return handleResponse(res, 404, msg.task.taskNotFound);

      await Task.findByIdAndDelete(taskId);

      // Notify project members
      const io = req.app.get("io");
      if (io) {
        io.to(`project:${task.projectId}`).emit("taskDeleted", {
          message: `Task "${task.title}" has been deleted.`,
          taskId,
          projectId: task.projectId,
        });
      }

      return handleResponse(res, 200, msg.task.taskDeletedSuccessfully);
    } catch (error) {
      handleError(res, msg.task.errorDeletingTask, error);
    }
  },

  async getAllTask(req, res) {
    try {
      const { id: projectId } = req.params;

      if (!isValidObjectId(projectId)) {
        return handleResponse(res, 400, msg.project.invalidProjectId);
      }

      const tasks = await Task.find({ projectId });
      if (!tasks?.length)
        return handleResponse(res, 404, msg.task.taskNotFound);

      return handleResponse(res, 200, msg.task.taskFetchedSuccessfully, tasks);
    } catch (error) {
      handleError(res, msg.task.errorFetchingTask, error);
    }
  },

  async getTasksForUser(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) return handleResponse(res, 400, msg.user.userNotExists);

      const tasks = await Task.find({ assignedTo: userId });
      return handleResponse(res, 200, msg.task.taskFetchedSuccessfully, tasks);
    } catch (error) {
      handleError(res, msg.task.errorFetchingTask, error);
    }
  },

  async getTaskById(req, res) {
    try {
      const { id: identifier } = req.params;
      const userId = req.user.id;

      // Find task by ID or customId
      const task = /^[0-9a-fA-F]{24}$/.test(identifier)
        ? await Task.findById(identifier).populate("projectId")
        : await Task.findOne({ customId: identifier }).populate("projectId");

      if (!task) return handleResponse(res, 404, msg.task.taskNotFound);

      // Check authorization
      const { projectId } = task;
      const isAuthorized =
        projectId.userId.toString() === userId ||
        projectId.member.some((memberId) => memberId.toString() === userId) ||
        (task.assignedTo && task.assignedTo.toString() === userId);

      if (!isAuthorized)
        return handleResponse(res, 403, msg.general.notAuthorized);

      return handleResponse(res, 200, msg.task.taskFetchedSuccessfully, task);
    } catch (error) {
      handleError(res, msg.task.errorFetchingTask, error);
    }
  },

  async updateTaskStatus(req, res) {
    try {
      const { taskId } = req.params;
      const { status } = req.body;

      if (!isValidObjectId(taskId)) {
        return handleResponse(res, 400, msg.task.invalidTaskId);
      }
      if (!status) return handleResponse(res, 400, msg.task.allFieldsRequired);

      const task = await Task.findById(taskId);
      if (!task) return handleResponse(res, 404, msg.task.taskNotFound);

      // Check if user is assigned to the task
      if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
        return handleResponse(res, 403, msg.general.notAuthorized);
      }

      task.status = status;
      await task.save();

      return handleResponse(res, 200, msg.task.taskUpdatedSuccessfully, task);
    } catch (error) {
      handleError(res, msg.task.errorUpdatingTask, error);
    }
  },

  sharedLinkTaskAccess(req, res) {
    const { permission } = req.query;
    return handleResponse(res, 200, "Task accessed via shared link", {
      task: req.task,
      accessLevel: permission,
    });
  },

  async addShareLink(req, res) {
    try {
      const { id } = req.params;
      const { link, permission, expiresAt } = req.body;

      const task = await Task.findByIdAndUpdate(
        id,
        { $push: { shareLinks: { link, permission, expiresAt } } },
        { new: true }
      );

      return handleResponse(res, 200, "Share link added successfully", task);
    } catch (error) {
      handleError(res, "Error adding share link", error);
    }
  },
};

module.exports = taskController;
