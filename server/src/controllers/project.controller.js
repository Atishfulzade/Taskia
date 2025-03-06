const Project = require("../models/project.model.js");
const msg = require("../utils/message-constant.json");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const Task = require("../models/task.model.js");
const Status = require("../models/status.model.js");

// Add a new project
const addProject = async (req, res) => {
  try {
    const { title, description, ...others } = req.body;
    const userId = req.user.id; // Assuming userId is set by authentication middleware

    // Check if title is provided
    if (!title) {
      return handleResponse(res, 400, msg.project.allFieldsRequired);
    }

    // Check if the project with the same title already exists
    const isAlreadyExist = await Project.findOne({ title });

    if (isAlreadyExist) {
      return handleResponse(res, 400, msg.project.projectTitleAlreadyExists);
    }

    // Create new project with userId
    const newProject = new Project({ title, description, userId, ...others });
    await newProject.save();

    // Fetch updated list of projects associated with the user
    const projects = await Project.find({ userId });

    // Return success response with the new project and updated list of projects
    return handleResponse(res, 200, msg.project.projectCreatedSuccessfully, {
      newProject,
      projects,
    });
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.project.errorCreatingProject, error);
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Find and update the project
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId },
      req.body,
      {
        new: true, // Return the updated project
      }
    );

    // If the project doesn't exist, return error
    if (!updatedProject) {
      return handleResponse(res, 404, msg.project.errorUpdatingProject);
    }

    // Return success response with the updated project
    return handleResponse(
      res,
      200,
      msg.project.projectFetchedSuccessfully,
      updatedProject
    );
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.project.errorUpdatingProject, error);
  }
};

// Get a project by ID
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    // Find the project by its ID
    const project = await Project.findById(projectId);

    // If project not found, return error
    if (!project) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    // Return success response with the project data
    return handleResponse(
      res,
      200,
      msg.project.projectFetchedSuccessfully,
      project
    );
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.project.errorFetchingProject, error);
  }
};

// Get all projects for a user
const getAllProjects = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find all projects associated with the user
    const projects = await Project.find({ userId });

    // If no projects found, return error
    if (projects.length === 0) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    // Return success response with the list of projects
    return handleResponse(
      res,
      200,
      msg.project.projectFetchedSuccessfully,
      projects
    );
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.project.errorFetchingProject, error);
  }
};

// Delete a project by ID
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    // Find the project to ensure it exists
    const project = await Project.findById(projectId);
    if (!project) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    // Delete all tasks associated with statuses under this project
    await Task.deleteMany({ project: projectId });

    // Delete all statuses related to this project
    await Status.deleteMany({ project: projectId });

    // Now delete the project
    await Project.findByIdAndDelete(projectId);

    // Return success response for project deletion
    return handleResponse(res, 200, msg.project.projectDeletedSuccessfully);
  } catch (error) {
    // Handle error and return error response
    handleError(res, msg.project.errorDeletingProject, error);
  }
};

module.exports = {
  addProject,
  getProjectById,
  deleteProject,
  updateProject,
  getAllProjects,
};
