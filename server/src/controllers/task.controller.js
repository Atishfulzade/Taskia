const handleError = require("../utils/common-functions.js")?.handleError;
const Task = require("../models/task.model.js");
const msg = require("../utils/message-constant.json");

// Add a new Task
const addTask = async (req, res) => {
  console.log(req.body);

  try {
    const { title, projectId, status, ...others } = req.body;

    // Check if the required fields are missing
    if (!title || !projectId || !status)
      return res.status(400).json({ message: msg.allFieldsRequired });

    // Check if the task already exists by title
    const isAlreadyExist = await Task.findOne({ title });

    if (isAlreadyExist) {
      return res.status(400).json({ message: msg.titleAlreadyExists });
    }

    // Create a new task instance with the provided data
    const newTask = new Task({ title, projectId, status, ...others });

    // Save the task to the database
    await newTask.save();

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

const updateTask = async (req, res) => {
  try {
    const TaskId = req.params.id;

    const newTask = await Task.findOneAndUpdate({ _id: TaskId }, req.body, {
      new: true,
    });
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

module.exports = {
  addTask,
  deleteTask,
  updateTask,
  getAllTask,
};
