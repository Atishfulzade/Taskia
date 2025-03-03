const mongoose = require("mongoose");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const Task = require("../models/task.model.js");
const msg = require("../utils/message-constant.json");

// Add a new task
const addTask = async (req, res) => {
  try {
    const { title, projectId, status, assignedTo, ...others } = req.body;

    // Check if required fields are provided
    if (!title || !projectId || !status) {
      return handleResponse(res, 400, msg.task.allFieldsRequired);
    }

    // Check if a task with the same title already exists
    const isAlreadyExist = await Task.findOne({ title });
    if (isAlreadyExist) {
      return handleResponse(res, 400, msg.task.taskTitleAlreadyExists);
    }

    // Create a new task
    const newTask = new Task({
      title,
      projectId,
      assignedTo,
      status,
      ...others,
    });
    await newTask.save();

    // Notify the assigned user via WebSocket (if applicable)
    if (assignedTo) {
      const io = req.app.get("io");
      io.to(assignedTo).emit("newTaskAssigned", {
        message: `A new task "${newTask.title}" has been assigned to you.`,
        task: newTask,
      });
    }

    // Return success response with the new task
    return handleResponse(res, 200, msg.task.taskCreatedSuccessfully, newTask);
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.task.errorCreatingTask, error);
  }
};

// Update an existing task
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    // Check if taskId is provided
    if (!taskId) {
      return handleResponse(res, 400, msg.task.invalidTaskId);
    }
    console.log(taskId);

    // Check if required fields are provided
    const { assignedTo, title } = req.body;
    if (!title) {
      return handleResponse(res, 400, msg.task.allFieldsRequired);
    }

    // Validate taskId format
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return handleResponse(res, 400, msg.task.invalidTaskId);
    }

    // Find and update the task
    const updatedTask = await Task.findByIdAndUpdate(taskId, req.body, {
      new: true, // Return the updated task
    });

    // If task not found, return error
    if (!updatedTask) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    // Notify the assigned user via WebSocket (if applicable)
    if (assignedTo && typeof assignedTo === "string") {
      const io = req.app.get("io");
      io.to(assignedTo).emit("newTaskAssigned", {
        message: `A new task "${title}" has been assigned to you.`,
        task: updatedTask,
      });
    }

    // Return success response with the updated task
    return handleResponse(
      res,
      200,
      msg.task.taskUpdatedSuccessfully,
      updatedTask
    );
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.task.errorUpdatingTask, error);
  }
};

// Get all tasks for a project
const getAllTask = async (req, res) => {
  const projectId = req.params.id;

  // Check if projectId is provided
  if (!projectId) {
    return handleResponse(res, 400, msg.project.invalidProjectId);
  }

  try {
    // Fetch all tasks for the given projectId
    const tasks = await Task.find({ projectId });

    // If no tasks found, return error
    if (!tasks.length) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    // Return success response with the list of tasks
    return handleResponse(res, 200, msg.task.taskFetchedSuccessfully, tasks);
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.task.errorFetchingTask, error);
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find and delete the task
    const task = await Task.findByIdAndDelete(taskId);

    // If task not found, return error
    if (!task) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    // Return success response for task deletion
    return handleResponse(res, 200, msg.task.taskDeletedSuccessfully);
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.task.errorDeletingTask, error);
  }
};

// Get tasks assigned to a specific user
const getTasksForUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Check if userId is provided
    if (!userId) {
      return handleResponse(res, 400, msg.user.userNotExists);
    }

    // Fetch tasks assigned to the user
    const tasks = await Task.find({ assignedTo: userId });

    // Return success response with the list of tasks
    return handleResponse(res, 200, msg.task.taskFetchedSuccessfully, tasks);
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.task.errorFetchingTask, error);
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    console.log(req.body);

    // Check if required fields are provided
    if (!taskId || !status) {
      return handleResponse(res, 400, msg.task.allFieldsRequired);
    }

    // Find the task
    const task = await Task.findById(taskId);

    // If task not found, return error
    if (!task) {
      return handleResponse(res, 404, msg.task.taskNotFound);
    }

    // Check if the user is authorized to update the task status
    if (task.assignedTo.toString() !== req.user.id) {
      return handleResponse(res, 403, msg.general.notAuthorized);
    }

    // Update the task status
    task.status = status;
    await task.save();

    // Return success response with the updated task
    return handleResponse(res, 200, msg.task.taskUpdatedSuccessfully, task);
  } catch (error) {
    // Handle error and return error response
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
