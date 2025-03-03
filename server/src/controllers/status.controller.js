const Status = require("../models/status.model.js");
const Task = require("../models/task.model.js");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const msg = require("../utils/message-constant.json");

// Add a new status
const addStatus = async (req, res) => {
  try {
    const { title, projectId, color } = req.body;

    // Check if title is provided
    if (!title) {
      return handleResponse(res, 400, msg.status.statusTitleRequired);
    }

    // Check if the status with the same title already exists for the project
    const isAlreadyExist = await Status.findOne({ title, projectId });
    if (isAlreadyExist) {
      return handleResponse(res, 400, msg.status.statusNameAlreadyExists);
    }

    // Create a new status and save it to the database
    const newStatus = new Status({ title, projectId, color });
    await newStatus.save();

    // Return the success response with the new status
    return handleResponse(
      res,
      200,
      msg.status.statusCreatedSuccessfully,
      newStatus
    );
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.status.errorCreatingStatus, error);
  }
};

// Get all statuses for a specific project
const getAllStatus = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    // Fetch statuses related to the given projectId
    const statuses = await Status.find({ projectId });

    // Check if there are no statuses found
    if (!statuses.length) {
      return handleResponse(res, 404, msg.status.statusNotFound);
    }

    // Return the success response with all statuses
    return handleResponse(res, 200, msg.status.statusFetchedSuccess, statuses);
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.status.errorFetchingStatus, error);
  }
};

const getStatusById = async (req, res) => {
  const statusId = req.params.id;

  // Validate statusId
  if (!statusId) {
    return handleResponse(res, 400, msg.status.invalidStatusId);
  }

  try {
    // Find the status by ID
    const status = await Status.findById(statusId);

    // Check if the status exists
    if (!status) {
      return handleResponse(res, 404, msg.status.statusNotFound);
    }

    // Return the status in the response
    return handleResponse(res, 200, msg.status.statusFetchedSuccess, status);
  } catch (error) {
    // Handle any errors that occur during the process
    handleError(res, msg.status.errorFetchingStatus, error);
  }
};
// Delete a status by its ID
const deleteStatus = async (req, res) => {
  try {
    const statusId = req.params.id;
    if (!statusId) {
      return handleResponse(res, 400, msg.status.invalidStatusId);
    }

    // Find the status to ensure it exists
    const status = await Status.findById(statusId);
    if (!status) {
      return handleResponse(res, 404, msg.status.statusNotFound);
    }

    // Delete all tasks related to this status
    await Task.deleteMany({ status: statusId });

    // Now delete the status
    await Status.findByIdAndDelete(statusId);

    // Return success response for status and related tasks deletion
    return handleResponse(res, 200, msg.status.statusDeletedSuccessfully);
  } catch (error) {
    // Handle error and return error response
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

    // Find the status and update with the new data
    const status = await Status.findByIdAndUpdate(statusId, req.body, {
      new: true, // Return the updated status
    });

    // If status not found, return an error response
    if (!status) {
      return handleResponse(res, 404, msg.status.statusNotFound);
    }

    // Return success response with the updated status
    return handleResponse(
      res,
      200,
      msg.status.statusUpdatedSuccessfully,
      status
    );
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.status.errorUpdatingStatus, error);
  }
};

module.exports = {
  addStatus,
  updateStatus,
  deleteStatus,
  getAllStatus,
  getStatusById,
};
