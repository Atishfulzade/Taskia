const Project = require("../models/project.model.js");
const Task = require("../models/task.model.js");
const Status = require("../models/status.model.js");
const msg = require("../utils/message-constant.json");
const { handleError, handleResponse } = require("../utils/common-functions.js");
const mongoose = require("mongoose");
const User = require("../models/user.model.js");

// Add a new project
const addProject = async (req, res) => {
  try {
    const { title, description, member = [], ...others } = req.body;
    const userId = req.user.id; // User ID set by auth middleware

    if (!title) {
      return handleResponse(res, 400, msg.project.allFieldsRequired);
    }

    const existingProject = await Project.findOne({ title, userId });
    if (existingProject) {
      return handleResponse(res, 400, msg.project.projectTitleAlreadyExists);
    }

    const newProject = new Project({
      title,
      description,
      userId,
      member,
      ...others,
    });

    await newProject.save();
    console.log("newProject:", newProject); // Debugging

    const allProjects = await Project.find({ userId });
    console.log("allProjects:", allProjects); // Debugging

    const io = req.app.get("io");
    console.log("io instance:", io); // Debugging

    if (!io) {
      throw new Error("Socket.IO instance not found");
    }

    console.log("member array:", member); // Debugging
    if (!Array.isArray(member)) {
      throw new Error("Invalid member array");
    }

    member.forEach((mem) => {
      console.log(`Emitting to member: ${mem}`); // Debugging
      io.to(mem).emit("projectAdded", {
        message: `You have been added to project: "${newProject.title}".`,
        project: newProject,
        allProjects,
      });
    });

    return handleResponse(res, 200, msg.project.projectCreatedSuccessfully, {
      project: newProject,
      allProjects,
    });
  } catch (error) {
    console.error("Error in addProject:", error); // Debugging
    handleError(res, msg.project.errorCreatingProject, error);
  }
};

// Update a project
// Update a project
const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId },
      req.body,
      { new: true }
    );

    if (!updatedProject) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    const io = req.app.get("io");

    // Emit to all members of the project, including the creator
    updatedProject.member.forEach((member) => {
      io.to(member).emit("projectUpdated", {
        message: `Project "${updatedProject.title}" has been updated.`,
        project: updatedProject,
      });
    });

    // Also emit to the project creator
    io.to(updatedProject.userId).emit("projectUpdated", {
      message: `Project "${updatedProject.title}" has been updated.`,
      project: updatedProject,
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

// Delete a project
const deleteProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    const project = await Project.findById(projectId).session(session);
    if (!project) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    const io = req.app.get("io");
    project.member.forEach((member) => {
      io.to(member).emit("projectDeleted", {
        message: `Project "${project.title}" has been deleted.`,
      });
    });

    await Task.deleteMany({ project: projectId }).session(session);
    await Status.deleteMany({ project: projectId }).session(session);
    await Project.findByIdAndDelete(projectId).session(session);

    await session.commitTransaction();
    return handleResponse(res, 200, msg.project.projectDeletedSuccessfully);
  } catch (error) {
    await session.abortTransaction();
    handleError(res, msg.project.errorDeletingProject, error);
  } finally {
    session.endSession();
  }
};

// Get a project by ID
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    return handleResponse(
      res,
      200,
      msg.project.projectFetchedSuccessfully,
      project
    );
  } catch (error) {
    handleError(res, msg.project.errorFetchingProject, error);
  }
};

// Fetch projects where user is a member
const getProjectsAsMember = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return handleResponse(res, 400, "Invalid user ID");
    }

    const projects = await Project.find({ member: userId })
      .populate("userId", "name email")
      .sort({ lastAccessed: -1 });

    if (!projects.length) {
      return handleResponse(res, 200, msg.project.noProjectsFound, []);
    }

    const currentDate = new Date();
    await Promise.all(
      projects.map(async (project) => {
        project.lastAccessed = currentDate;
        await project.save();
      })
    );

    return handleResponse(
      res,
      200,
      msg.project.projectFetchedSuccessfully,
      projects
    );
  } catch (error) {
    handleError(res, msg.project.errorFetchingProject, error);
  }
};

// Get all projects for a user
const getAllProjectsByUser = async (req, res) => {
  const userId = req.user.id;
  console.log("myProject", userId);

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return handleResponse(res, 400, "Invalid user ID");
  }

  try {
    const projects = await Project.find({ userId });

    if (!projects.length) {
      return handleResponse(res, 200, msg.project.noProjectsFound, []);
    }

    return handleResponse(
      res,
      200,
      msg.project.projectFetchedSuccessfully,
      projects
    );
  } catch (error) {
    handleError(res, msg.project.errorFetchingProject, error);
  }
};
// Backend API to share a project
const sharedProject = async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the user to the project's members
    const project = await Project.findById(projectId);
    if (!project.member.includes(user._id)) {
      project.member.push(user._id);
      await project.save();
    }

    // Emit a Socket.IO event to notify the user
    const io = req.app.get("io");
    io.to(user._id.toString()).emit("projectAdded", {
      message: `You have been added to project: "${project.title}".`,
      project,
    });

    res.json({ message: "Project shared successfully" });
  } catch (error) {
    console.error("Error sharing project:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  addProject,
  updateProject,
  getAllProjectsByUser,
  getProjectById,
  deleteProject,
  getProjectsAsMember,
  sharedProject,
};
