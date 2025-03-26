const mongoose = require("mongoose");
const { isValidObjectId } = mongoose;
const User = require("../models/user.model.js");
const Project = require("../models/project.model.js");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const Task = require("../models/task.model.js");
const msg = require("../utils/message-constant.json");
const { generateUniqueId } = require("../utils/generateUniqueId.js");

// Add a new task
const addTask = async (req, res) => {
  console.log("add task called", req.body);
  try {
    const { title, projectId, status, assignedTo, useCustomId, ...others } =
      req.body.data;

    // Validate required fields
    if (!title || !projectId || !status) {
      return handleResponse(res, 400, msg.task.allFieldsRequired);
    }

    // Validate projectId format
    if (!isValidObjectId(projectId)) {
      return handleResponse(res, 400, msg.task.invalidProjectId);
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    // Check if a task with the same title already exists
    const isAlreadyExist = await Task.findOne({ title, projectId });
    if (isAlreadyExist) {
      return handleResponse(res, 400, msg.task.taskTitleAlreadyExists);
    }

    // Validate assignedTo field (Convert empty string to null)
    let validAssignedTo = null;
    if (assignedTo && isValidObjectId(assignedTo)) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return handleResponse(res, 400, msg.user.userNotExists);
      }
      validAssignedTo = assignedTo;
    }

    // Prepare task data
    const taskData = {
      title,
      projectId,
      assignedTo: validAssignedTo,
      status,
      ...others,
    };

    // Generate custom ID if requested
    if (useCustomId) {
      taskData.customId = await generateUniqueId({
        type: "task",
        name: title,
        projectInitials: project.customId?.split("-")[0] || "TASK", // Use project initials if available
      });
    }

    // Create and save new task
    const newTask = new Task(taskData);
    await newTask.save();

    const io = req.app.get("io");
    if (!io) {
      console.error("Socket instance not available");
      return handleResponse(
        res,
        200,
        msg.task.taskCreatedSuccessfully,
        newTask
      );
    }

    const projectRoomId = `project:${projectId}`;
    console.log(`Emitting taskCreated event to room: ${projectRoomId}`);

    // Notify the assigned user personally
    if (validAssignedTo) {
      io.to(validAssignedTo.toString()).emit("taskAssigned", {
        message: `A new task "${newTask.title}" has been assigned to you.`,
        newTask,
      });
      console.log(
        `Task assigned notification sent to user: ${validAssignedTo}`
      );
    }

    // Notify all project members about the new task
    io.to(projectRoomId).emit("taskCreated", {
      message: `A new task "${newTask.title}" has been created.`,
      task: newTask,
    });

    return handleResponse(res, 200, msg.task.taskCreatedSuccessfully, newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    handleError(res, msg.task.errorCreatingTask, error);
  }
};
// Update an existing task
const updateTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { assignedTo, ...others } = req.body;

    // Validate taskId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return handleResponse(res, 400, msg.task.invalidTaskId);
    }

    // Get the original task to check for changes
    const originalTask = await Task.findById(taskId);
    if (!originalTask) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
    });

    const io = req.app.get("io");
    const projectRoomId = `project:${updatedTask.projectId}`;

    // Check if assignee has changed
    const originalAssignee = originalTask.assignedTo
      ? originalTask.assignedTo.toString()
      : null;
    const newAssignee =
      assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)
        ? assignedTo
        : null;

    // If there's a new assignee different from the original
    if (newAssignee && newAssignee !== originalAssignee) {
      // Notify the newly assigned user personally
      io.to(newAssignee).emit("taskAssigned", {
        message: `Task "${updatedTask.title}" has been assigned to you.`,
        updatedTask,
      });
    }

    // Notify all project members about the task update
    io.to(projectRoomId).emit("taskUpdated", {
      message: `Task "${updatedTask.title}" has been updated.`,
      updatedTask,
    });

    return handleResponse(
      res,
      200,
      msg.task.taskUpdatedSuccessfully,
      updatedTask
    );
  } catch (error) {
    handleError(res, msg.task.errorUpdatingTask, error);
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return handleResponse(res, 400, msg.task.invalidTaskId);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    const projectId = task.projectId;
    const io = req.app.get("io");
    const projectRoomId = `project:${projectId}`;

    // Delete the task
    await Task.findByIdAndDelete(taskId);

    // Notify all project members about the task deletion
    io.to(projectRoomId).emit("taskDeleted", {
      message: `Task "${task.title}" has been deleted.`,
      taskId,
      projectId,
    });

    return handleResponse(res, 200, msg.task.taskDeletedSuccessfully);
  } catch (error) {
    handleError(res, msg.task.errorDeletingTask, error);
  }
};

// Get all tasks for a project
const getAllTask = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    const tasks = await Task.find({ projectId });

    if (!tasks || tasks.length === 0) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    return handleResponse(res, 200, msg.task.taskFetchedSuccessfully, tasks);
  } catch (error) {
    handleError(res, msg.task.errorFetchingTask, error);
  }
};

// Get tasks assigned to a specific user
const getTasksForUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return handleResponse(res, 400, msg.user.userNotExists);
    }

    const tasks = await Task.find({ assignedTo: userId });

    return handleResponse(res, 200, msg.task.taskFetchedSuccessfully, tasks);
  } catch (error) {
    handleError(res, msg.task.errorFetchingTask, error);
  }
};

// Get a specific task
const getTaskById = async (req, res) => {
  try {
    const { id: identifier } = req.params;

    // Check if the identifier is a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

    let task;
    if (isObjectId) {
      // Search by _id if it's a valid ObjectId
      task = await Task.findById(identifier);
    } else {
      // Search by customId if it's not an ObjectId
      task = await Task.findOne({ customId: identifier });
    }

    if (!task) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    return handleResponse(res, 200, msg.task.taskFetchedSuccessfully, task);
  } catch (error) {
    handleError(res, msg.task.errorFetchingTask, error);
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return handleResponse(res, 400, msg.task.invalidTaskId);
    }

    if (!status) {
      return handleResponse(res, 400, msg.task.allFieldsRequired);
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
      return handleResponse(res, 403, msg.general.notAuthorized);
    }

    task.status = status;
    await task.save();

    return handleResponse(res, 200, msg.task.taskUpdatedSuccessfully, task);
  } catch (error) {
    handleError(res, msg.task.errorUpdatingTask, error);
  }
};

module.exports = {
  addTask,
  updateTask,
  getAllTask,
  getTaskById,
  deleteTask,
  getTasksForUser,
  updateTaskStatus,
};
