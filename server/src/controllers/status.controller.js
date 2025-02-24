const Status = require("../models/status.model.js");
const handleError = require("../utils/common-functions.js")?.handleError;
const msg = require("../utils/message-constant.json");
// Add a new status
const addStatus = async (req, res) => {
  try {
    const { title, projectId } = req.body;

    if (!title) return res.status(400).json({ message: msg.titleIsRequired });

    const isAlreadyExist = await Status.findOne({ title, projectId });

    if (isAlreadyExist) {
      return res.status(400).json({ message: msg.titleAlreadyExists });
    }

    const newStatus = new Status({ title, projectId });
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
    const projectId = req.params.id;
    const status = await Status.findByIdAndDelete(projectId);

    if (!status) {
      return res.status(404).json({ message: msg.statusNotFound });
    }

    res.status(200).json({ message: msg.statusDeletedSuccessfully });
  } catch (error) {
    res.status(500).json({ message: msg.internalServerError, error });
  }
};

module.exports = {
  addStatus,
  deleteStatus,
  getAllStatus,
};
