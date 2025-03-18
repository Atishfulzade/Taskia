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
    console.log("[DEBUG] addProject called with body:", req.body);
    const { title, description, member = [], ...others } = req.body;
    const userId = req.user.id;

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
    const allProjects = await Project.find({ userId });

    const io = req.app.get("io");
    if (!io) {
      console.error("[ERROR] Socket.IO instance not found");
      throw new Error("Socket.IO instance not found");
    }

    console.log(
      "[DEBUG] Emitting projectInvitation events for members:",
      member
    );
    member.forEach((memberId) => {
      if (mongoose.Types.ObjectId.isValid(memberId)) {
        io.to(memberId).emit("projectInvitation", {
          message: `You have been added to project: "${newProject.title}".`,
          newProject,
          allProjects,
        });
      }
    });

    console.log("[DEBUG] Joining project room for creator:", userId);
    io.in(userId).socketsJoin(`project:${newProject._id.toString()}`);

    return handleResponse(res, 200, msg.project.projectCreatedSuccessfully, {
      newProject,
      allProjects,
    });
  } catch (error) {
    console.error("[ERROR] addProject:", error);
    handleError(res, msg.project.errorCreatingProject, error);
  }
};

// Update a project
const updateProject = async (req, res) => {
  try {
    console.log("[DEBUG] updateProject called for:", req.params.id);
    const projectId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    const updatedProject = await Project.findOneAndUpdate(
      { _id: projectId },
      req.body,
      { new: true }
    );

    console.log("[DEBUG] Project updated:", updatedProject);
    const io = req.app.get("io");
    const projectRoomId = `project:${projectId}`;

    console.log("[DEBUG] Emitting projectUpdated event for:", projectRoomId);
    io.to(projectRoomId).emit("projectUpdated", {
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
    console.error("[ERROR] updateProject:", error);
    handleError(res, msg.project.errorUpdatingProject, error);
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log("[DEBUG] deleteProject called for:", req.params.id);
    const projectId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return handleResponse(res, 400, msg.project.invalidProjectId);
    }

    const project = await Project.findById(projectId).session(session);
    if (!project) {
      return handleResponse(res, 404, msg.project.projectNotFound);
    }

    const io = req.app.get("io");
    console.log("[DEBUG] Emitting projectDeleted event:", projectId);
    io.to(`project:${projectId}`).emit("projectDeleted", {
      message: `Project "${project.title}" has been deleted.`,
      projectId,
    });

    await Task.deleteMany({ projectId }).session(session);
    await Status.deleteMany({ projectId }).session(session);
    await Project.findByIdAndDelete(projectId).session(session);

    await session.commitTransaction();
    return handleResponse(res, 200, msg.project.projectDeletedSuccessfully);
  } catch (error) {
    await session.abortTransaction();
    console.error("[ERROR] deleteProject:", error);
    handleError(res, msg.project.errorDeletingProject, error);
  } finally {
    session.endSession();
  }
};

// Share a project with a user by email
const sharedProject = async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }

    // Add the user to the project's members
    const project = await Project.findById(projectId);
    if (!project) {
      return handleResponse(res, 404, "Project not found");
    }

    if (!project.member.includes(user._id)) {
      project.member.push(user._id);
      await project.save();
    }

    // Emit a Socket.IO event to notify the user
    const io = req.app.get("io");
    const projectRoomId = `project:${projectId}`;

    // Send personal notification to the user
    io.to(user._id.toString()).emit("projectInvitation", {
      message: `You have been added to project: "${project.title}".`,
      project,
    });

    // Add user to the project room
    io.in(user._id.toString()).socketsJoin(projectRoomId);

    return handleResponse(res, 200, "Project shared successfully");
  } catch (error) {
    console.error("Error sharing project:", error);
    handleError(res, "Internal Server Error", error);
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

// Export all functions
module.exports = {
  addProject,
  updateProject,
  deleteProject,
  sharedProject,
  getProjectById,
  getProjectsAsMember,
  getAllProjectsByUser,
};
