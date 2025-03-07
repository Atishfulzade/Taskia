const mongoose = require("mongoose");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const Task = require("../models/task.model.js");
const msg = require("../utils/message-constant.json");

// Add a new task
const addTask = async (req, res) => {
  try {
    const { title, projectId, status, assignedTo, ...others } = req.body;

    // Validate required fields
    if (!title || !projectId || !status) {
      return handleResponse(res, 400, msg.task.allFieldsRequired);
    }

    // Validate projectId format
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return handleResponse(res, 400, msg.task.invalidProjectId);
    }

    // Check if a task with the same title already exists
    const isAlreadyExist = await Task.findOne({ title });
    if (isAlreadyExist) {
      return handleResponse(res, 400, msg.task.taskTitleAlreadyExists);
    }
    console.log("error not found");

    // Validate assignedTo field (Convert empty string to null)
    const validAssignedTo =
      assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)
        ? assignedTo
        : null;

    // Create a new task
    const newTask = new Task({
      title,
      projectId,
      assignedTo: validAssignedTo,
      status,
      ...others,
    });

    await newTask.save();

    // Notify assigned user via WebSocket
    if (validAssignedTo) {
      const io = req.app.get("io");
      io.to(validAssignedTo).emit("newTaskAssigned", {
        message: `A new task "${newTask.title}" has been assigned to you.`,
        task: newTask,
      });
    }

    return handleResponse(res, 200, msg.task.taskCreatedSuccessfully, newTask);
  } catch (error) {
    handleError(res, msg.task.errorCreatingTask, error);
  }
};

// Update an existing task
const updateTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { assignedTo, title } = req.body;

    // Validate taskId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return handleResponse(res, 400, msg.task.invalidTaskId);
    }

    if (!title) {
      return handleResponse(res, 400, msg.task.allFieldsRequired);
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true,
    });

    if (!updatedTask) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    const validAssignedTo =
      assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)
        ? assignedTo
        : null;

    // Notify assigned user via WebSocket
    if (validAssignedTo) {
      const io = req.app.get("io");
      io.to(validAssignedTo).emit("taskUpdated", {
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

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return handleResponse(res, 400, msg.task.invalidTaskId);
    }

    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    return handleResponse(res, 200, msg.task.taskDeletedSuccessfully);
  } catch (error) {
    handleError(res, msg.task.errorDeletingTask, error);
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
  deleteTask,
  getTasksForUser,
  updateTaskStatus,
};
