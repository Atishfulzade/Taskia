const Project = require("../models/project.model.js");
const msg = require("../utils/message-constant.json");
const handleError = require("../utils/common-functions").handleError;

// Add a new project
const addProject = async (req, res) => {
  try {
    const { title, description, isPrivate } = req.body;
    const userId = req.user.id; // Assuming userId is set by authentication middleware

    if (!title) return res.status(400).json({ message: msg.titleIsRequired });

    const isAlreadyExist = await Project.findOne({ title });

    if (isAlreadyExist) {
      return res.status(400).json({ message: msg.titleAlreadyExists });
    }

    // Create new project with userId
    const newProject = new Project({ title, description, isPrivate, userId });
    await newProject.save();

    // Fetch updated list of projects associated with the user
    const projects = await Project.find({ userId });

    res.status(200).json({
      message: msg.projectCreatedSuccessfully,
      newProject,
      projects,
    });
  } catch (error) {
    handleError(res, msg.errorCreatingProject, error);
  }
};

//update project
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const newProject = await Project.findOneAndUpdate(
      { _id: projectId },
      req.body,
      {
        new: true,
      }
    );
    res
      .status(200)
      .json({ message: msg.projectUpdatedSuccessfully, project: newProject });
  } catch (error) {
    handleError(res, msg.errorUpdatingProject, error);
  }
};

// Get a project by ID
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: msg.projectNotFound });
    }

    res.status(200).json({ message: msg.projectFetchedSuccessfully, project });
  } catch (error) {
    handleError(res, msg.errorFetchingProject, error);
  }
};

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    const project = await Project.find({});

    if (!project) {
      return res.status(404).json({ message: msg.projectNotFound });
    }

    res
      .status(200)
      .json({ message: msg.projectFetchedSuccessfully, data: project });
    console.log(project);
  } catch (error) {
    handleError(res, msg.errorFetchingProject, error);
  }
};

// Delete a project by ID
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Find the project first
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: msg.projectNotFound });
    }

    // Delete all tasks associated with statuses under this project
    await Task.deleteMany({ project: projectId });

    // Delete all statuses related to this project
    await Status.deleteMany({ project: projectId });

    // Now delete the project
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({ message: msg.projectDeletedSuccessfully });
  } catch (error) {
    res.status(500).json({ message: msg.internalServerError, error });
  }
};

module.exports = {
  addProject,
  getProjectById,
  deleteProject,
  updateProject,
  getAllProjects,
};
