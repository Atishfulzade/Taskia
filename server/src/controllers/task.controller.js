const handleError = require("../utils/common-functions.js")?.handleError;
const Task = require("../models/task.model.js");
const msg = require("../utils/message-constant.json");
const io = require("socket.io");
const addTask = async (req, res) => {
  console.log(req.body);

  try {
    const { title, projectId, status, assignedTo, ...others } = req.body;

    // Check if the required fields are missing
    if (!title || !projectId || !status)
      return res.status(400).json({ message: msg.allFieldsRequired });

    // Check if the task already exists by title
    const isAlreadyExist = await Task.findOne({ title });

    if (isAlreadyExist) {
      return res.status(400).json({ message: msg.titleAlreadyExists });
    }

    // Create a new task instance with the provided data
    const newTask = new Task({
      title,
      projectId,
      assignedTo,
      status,
      ...others,
    });

    // Save the task to the database
    await newTask.save();

    // Emit a Socket.IO event if the task is assigned to someone
    if (assignedTo) {
      const io = req.app.get("io"); // Get the io instance
      io.to(assignedTo.toString()).emit("newTaskAssigned", {
        message: `A new task "${title}" has been assigned to you.`,
        task: newTask,
      });
    }

    // Send a response indicating success
    res.status(200).json({
      message: msg.taskCreatedSuccessfully,
      data: newTask,
    });
  } catch (error) {
    // Handle errors that might occur during task creation
    handleError(res, msg.errorCreatingTask, error);
  }
};

// Update a Task
const updateTask = async (req, res) => {
  try {
    const TaskId = req.params.id;
    const { assignedTo } = req.body;

    const newTask = await Task.findOneAndUpdate({ _id: TaskId }, req.body, {
      new: true,
    });

    // Emit a Socket.IO event if the task is assigned to someone
    if (assignedTo) {
      const io = req.app.get("io"); // Get the io instance
      io.to(assignedTo.toString()).emit("newTaskAssigned", {
        message: `You have been assigned a new task: "${newTask.title}"`,
        newTask,
      });
    }

    res
      .status(200)
      .json({ message: msg.taskUpdatedSuccessfully, Task: newTask });
  } catch (error) {
    handleError(res, msg.internalServerError, error);
  }
};

// Get all Tasks
const getAllTask = async (req, res) => {
  const projectId = req.params.id;

  try {
    const task = await Task.find({ projectId: projectId });

    if (!task) {
      return res.status(404).json({ message: msg.taskNotFound });
    }

    res.status(200).json({ message: msg.taskFetchedSuccessfully, data: task });
  } catch (error) {
    handleError(res, msg.errorFetchingTask, error);
  }
};

// Delete a Task by ID
const deleteTask = async (req, res) => {
  try {
    const TaskId = req.params.id;

    const task = await Task.findByIdAndDelete(TaskId);

    if (!task) {
      return res.status(404).json({ message: msg.taskNotFound });
    }

    res.status(200).json({ message: msg.taskDeletedSuccessfully });
  } catch (error) {
    res.status(500).json({ message: msg.internalServerError, error });
  }
};

const getTasksForUser = async (req, res) => {
  try {
    console.log("User ID:", req.user?.id); // Debugging Step 1: Check User ID

    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ message: "User ID is missing in request." });
    }

    const tasks = await Task.find({ assignedTo: req.user.id });

    console.log("Tasks Found:", tasks); // Debugging Step 2: Log Retrieved Tasks

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error); // Debugging Step 3: Log Errors
    return res.status(500).json({ message: "Failed to fetch tasks", error });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: msg.taskNotFound });

    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: msg.unauthorized });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ message: msg.taskUpdated, task });
  } catch (error) {
    handleError(res, msg.taskUpdateFailed, error);
  }
};

module.exports = {
  addTask,
  deleteTask,
  updateTask,
  getAllTask,
  getTasksForUser,
  updateTaskStatus,
};
