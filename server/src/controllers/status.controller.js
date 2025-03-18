const Status = require("../models/status.model.js");
const Task = require("../models/task.model.js");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const msg = require("../utils/message-constant.json");

// Add a new status
const addStatus = async (req, res) => {
  try {
    const { title, projectId, color } = req.body;

    if (!title) {
      return handleResponse(res, 400, msg.status.statusTitleRequired);
    }

    const isAlreadyExist = await Status.findOne({ title, projectId });
    if (isAlreadyExist) {
      return handleResponse(res, 400, msg.status.statusNameAlreadyExists);
    }

    const newStatus = new Status({ title, projectId, color });
    await newStatus.save();

    // Emit event to all project members using the correct room format
    const io = req.app.get("io");
    const roomId = `project:${projectId}`;
    console.log(
      `[DEBUG] Emitting 'statusCreated' event to project room: ${roomId}`
    );
    io.to(roomId).emit("statusCreated", {
      message: `New status "${title}" has been created.`,
      newStatus,
    });

    console.log("[INFO] Status created:", newStatus);
    return handleResponse(
      res,
      200,
      msg.status.statusCreatedSuccessfully,
      newStatus
    );
  } catch (error) {
    handleError(res, msg.status.errorCreatingStatus, error);
  }
};

// Delete a status by its ID
const deleteStatus = async (req, res) => {
  try {
    const statusId = req.params.id;
    if (!statusId) {
      return handleResponse(res, 400, msg.status.invalidStatusId);
    }

    const status = await Status.findById(statusId);
    if (!status) {
      return handleResponse(res, 404, msg.status.statusNotFound);
    }

    const projectId = status.projectId;
    await Task.deleteMany({ status: statusId });
    await Status.findByIdAndDelete(statusId);

    // Emit event to all project members using the correct room format
    const io = req.app.get("io");
    const roomId = `project:${projectId}`;
    console.log(
      `[DEBUG] Emitting 'statusDeleted' event to project room: ${roomId}`
    );
    io.to(roomId).emit("statusDeleted", {
      message: `Status "${status.title}" has been deleted.`,
      statusId,
      projectId,
    });

    return handleResponse(res, 200, msg.status.statusDeletedSuccessfully);
  } catch (error) {
    handleError(res, msg.status.errorDeletingStatus, error);
  }
};

// Update a status by its ID
const updateStatus = async (req, res) => {
  try {
    const statusId = req.params.id;
    if (!statusId) {
      return handleResponse(res, 400, msg.status.invalidStatusId);
    }

    const status = await Status.findById(statusId);
    if (!status) {
      return handleResponse(res, 404, msg.status.statusNotFound);
    }

    const projectId = status.projectId;
    const updatedStatus = await Status.findByIdAndUpdate(statusId, req.body, {
      new: true,
    });

    // Emit event to all project members using the correct room format
    const io = req.app.get("io");
    const roomId = `project:${projectId}`;
    console.log(
      `[DEBUG] Emitting 'statusUpdated' event to project room: ${roomId}`
    );
    io.to(roomId).emit("statusUpdated", {
      message: `Status "${updatedStatus.title}" has been updated.`,
      updatedStatus,
    });

    return handleResponse(
      res,
      200,
      msg.status.statusUpdatedSuccessfully,
      updatedStatus
    );
  } catch (error) {
    handleError(res, msg.status.errorUpdatingStatus, error);
  }
};

// Get all statuses for a specific project
const getAllStatus = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    const statuses = await Status.find({ projectId });

    if (!statuses.length) {
      return handleResponse(res, 404, msg.status.statusNotFound);
    }

    console.log(
      `[INFO] Retrieved ${statuses.length} statuses for project: ${projectId}`
    );
    return handleResponse(res, 200, msg.status.statusFetchedSuccess, statuses);
  } catch (error) {
    handleError(res, msg.status.errorFetchingStatus, error);
  }
};

// Get a specific status by its ID
const getStatusById = async (req, res) => {
  const statusId = req.params.id;

  if (!statusId) {
    return handleResponse(res, 400, msg.status.invalidStatusId);
  }

  try {
    const status = await Status.findById(statusId);
    if (!status) {
      return handleResponse(res, 404, msg.status.statusNotFound);
    }

    console.log(`[INFO] Fetched status: ${status.title} (ID: ${statusId})`);
    return handleResponse(res, 200, msg.status.statusFetchedSuccess, status);
  } catch (error) {
    handleError(res, msg.status.errorFetchingStatus, error);
  }
};

module.exports = {
  addStatus,
  updateStatus,
  deleteStatus,
  getAllStatus,
  getStatusById,
};
