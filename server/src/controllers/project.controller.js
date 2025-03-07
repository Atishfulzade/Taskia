const Project = require("../models/project.model.js");
const Task = require("../models/task.model.js");
const Status = require("../models/status.model.js");
const msg = require("../utils/message-constant.json");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

// Add a new project
const addProject = async (req, res) => {
  try {
    const { title, description, member = [], ...others } = req.body; // Default `member` to an empty array
    const userId = req.user.id; // Assuming userId is set by authentication middleware

    // Validate required fields
    if (!title) {
      return handleResponse(res, 400, msg.project.allFieldsRequired);
    }

    // Check if a project with the same title already exists
    const isAlreadyExist = await Project.findOne({ title, userId });

    if (isAlreadyExist) {
      return handleResponse(res, 400, msg.project.projectTitleAlreadyExists);
    }

    // Create a new project
    const newProject = new Project({
      title,
      description,
      userId,
      member,
      ...others,
    });

    // Save the new project to the database
    await newProject.save();

    // Fetch the updated list of all projects for the user
    const allProjects = await Project.find({ userId });

    // Emit socket.io events to notify members
    const io = req.app.get("io");

    if (member && member.length > 0) {
      member.forEach((mem) => {
        io.to(mem).emit("addedToProject", {
          message: `You have been added to project: "${newProject.title}".`,
          project: newProject,
        });
      });
    }

    // Return success response with the new project and the list of all projects
    return handleResponse(res, 200, msg.project.projectCreatedSuccessfully, {
      newProject, // The newly added project
      allProjects, // The updated list of all projects
    });
  } catch (error) {
    // Handle errors and return an error response
    handleError(res, msg.project.errorCreatingProject, error);
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId },
      req.body,
      { new: true }
    );

    if (!updatedProject) {
      return handleResponse(res, 404, msg.project.errorUpdatingProject);
    }

    const io = req.app.get("io");

    // Notify all project members about the update
    updatedProject.member.forEach((member) => {
      io.to(member).emit("projectUpdated", {
        message: `Project "${updatedProject.title}" has been updated.`,
        project: updatedProject,
      });
    });

    return handleResponse(
      res,
      200,
      msg.project.projectUpdatedSuccessfully,
      updatedProject
    );
  } catch (error) {
    handleError(res, msg.project.errorUpdatingProject, error);
  }
};

const getAllProjectsByUser = async (req, res) => {
  const userId = req.user.id; // Ensure this matches the user's ID field in MongoDB

  // Debug: Log the user object
  console.log("User:", req.user);

  // Check if userId is valid
  if (!userId || !ObjectId.isValid(userId)) {
    return handleResponse(res, 400, "Invalid user ID", null);
  }

  try {
    // Debug: Log the userId being queried
    console.log("Fetching projects for user ID:", userId);

    // Fetch all projects associated with the user
    const projects = await Project.find({ userId });

    // Debug: Log the projects found
    console.log("Projects found:", projects);

    // If no projects found, return an empty array
    if (!projects.length) {
      return handleResponse(res, 200, msg.project.noProjectsFound, []);
    }

    // Return success response with the list of projects
    return handleResponse(
      res,
      200,
      msg.project.projectFetchedSuccessfully,
      projects
    );
  } catch (error) {
    // Log the error and return an error response
    console.error(`Error fetching projects for user ${userId}:`, error);
    handleError(res, msg.project.errorFetchingProject, error);
  }
};

// Get a project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    // Find the project by ID
    const project = await Project.findById(id);

    // If project not found, return error
    if (!project) {
      console.log("Project not found");

      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    // Return success response with the project details
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

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!projectId) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    // Notify all members before deletion
    const io = req.app.get("io");

    project.member.forEach((mem) => {
      io.to(mem).emit("projectDeleted", {
        message: `Project "${project.title}" has been deleted.`,
      });
    });

    await Task.deleteMany({ project: projectId });
    await Status.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);

    return handleResponse(res, 200, msg.project.projectDeletedSuccessfully);
  } catch (error) {
    handleError(res, msg.project.errorDeletingProject, error);
  }
};

// Get projects where user is a member
const getProjectsAsMember = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if userId is valid
    if (!userId || !ObjectId.isValid(userId)) {
      return handleResponse(res, 400, "Invalid user ID", null);
    }

    // Find all projects where the user is a member
    const projects = await Project.find({ member: userId })
      .populate("userId", "name email") // Populate creator info
      .sort({ lastAccessed: -1 }); // Sort by most recently accessed

    // If no projects found, return an empty array with appropriate message
    if (!projects.length) {
      return handleResponse(
        res,
        200,
        "No projects found where you are a member",
        []
      );
    }

    // Update lastAccessed for each project
    const currentDate = new Date();
    for (const project of projects) {
      project.lastAccessed = currentDate;
      await project.save();
    }

    // Return success response with the list of projects
    return handleResponse(
      res,
      200,
      "Projects fetched successfully where you are a member",
      projects
    );
  } catch (error) {
    // Log the error and return an error response
    console.error(
      `Error fetching member projects for user ${req.user.id}:`,
      error
    );
    handleError(res, "Error fetching projects where you are a member", error);
  }
};

// Get all projects (created by user + where user is a member)
const getAllUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if userId is valid
    if (!userId || !ObjectId.isValid(userId)) {
      return handleResponse(res, 400, "Invalid user ID", null);
    }

    // Find all projects where user is creator or member
    const projects = await Project.find({
      $or: [
        { userId: userId }, // Projects created by user
        { member: userId }, // Projects where user is a member
      ],
    })
      .populate("userId", "name email")
      .sort({ lastAccessed: -1 });

    // If no projects found, return an empty array
    if (!projects.length) {
      return handleResponse(res, 200, "No projects found", []);
    }

    // Update lastAccessed for each project
    const currentDate = new Date();
    for (const project of projects) {
      project.lastAccessed = currentDate;
      await project.save();
    }

    // Return success response with the list of projects
    return handleResponse(
      res,
      200,
      "All projects fetched successfully",
      projects
    );
  } catch (error) {
    console.error(
      `Error fetching all projects for user ${req.user.id}:`,
      error
    );
    handleError(res, "Error fetching all projects", error);
  }
};

module.exports = {
  addProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjectsByUser,
  getProjectsAsMember,
  getAllUserProjects,
};
