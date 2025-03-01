const Status = require("../models/status.model.js");
const Task = require("../models/task.model.js");
const handleError = require("../utils/common-functions.js")?.handleError;
const msg = require("../utils/message-constant.json");
// Add a new status
const addStatus = async (req, res) => {
  try {
    const { title, projectId, color } = req.body;

    if (!title) return res.status(400).json({ message: msg.titleIsRequired });

    const isAlreadyExist = await Status.findOne({ title, projectId });

    if (isAlreadyExist) {
      return res.status(400).json({ message: msg.titleAlreadyExists });
    }

    const newStatus = new Status({ title, projectId, color });
    await newStatus.save();

    res
      .status(200)
      .json({ message: msg.statusCreatedSuccessfully, data: newStatus });
  } catch (error) {
    handleError(res, msg.errorCreatingStatus, error);
  }
};

// Get all projects
const getAllStatus = async (req, res) => {
  try {
    const projectId = req.params.id;

    const statuses = await Status.find({ projectId });

    if (!statuses.length) {
      return res.status(404).json({ message: msg.statusNotFound });
    }

    res
      .status(200)
      .json({ message: msg.statusUpdatedSuccessfully, data: statuses });
  } catch (error) {
    handleError(res, msg.errorFetchingStatus, error);
  }
};

// Delete a status by ID
const deleteStatus = async (req, res) => {
  try {
    const statusId = req.params.id;

    // Find the status to ensure it exists
    const status = await Status.findById(statusId);
    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    // Delete all tasks related to this status
    await Task.deleteMany({ status: statusId });

    // Now delete the status
    await Status.findByIdAndDelete(statusId);

    res
      .status(200)
      .json({ message: "Status and related tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// Update a status by ID

const updateStatus = async (req, res) => {
  try {
    const statusId = req.params.id; // Corrected the variable name
    const status = await Status.findByIdAndUpdate(statusId, req.body, {
      new: true,
    });

    if (!status) {
      return res.status(404).json({ message: msg.statusNotFound });
    }

    res
      .status(200)
      .json({ message: msg.statusUpdatedSuccessfully, data: status });
  } catch (error) {
    handleError(res, msg.errorUpdatingStatus, error);
  }
};

module.exports = {
  addStatus,
  updateStatus,
  deleteStatus,
  getAllStatus,
};
