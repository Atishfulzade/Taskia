const router = require("express").Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");
const {
  addProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjectsByUser,
  getProjectsAsMember,
  sharedProject,
} = require("../controllers/project.controller.js");

// Add a new project
router.post("/add", verifyUser, addProject);

// Get a project by ID
router.post("/get/:id", verifyUser, getProjectById);

// Get all projects for the authenticated user
router.post("/all", verifyUser, getAllProjectsByUser);

// Get all projects where the user is a member
router.post("/member", verifyUser, getProjectsAsMember);

// Update a project by ID
router.post("/update/:id", verifyUser, updateProject);

// Delete a project by ID
router.post("/delete/:id", verifyUser, deleteProject);
router.post("/share/:projectId", verifyUser, sharedProject);

module.exports = router;
