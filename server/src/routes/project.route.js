const router = require("express")?.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");
const {
  addProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjectsByUser,
  getProjectsAsMember,
  getAllUserProjects,
} = require("../controllers/project.controller.js");

//Add new project
router.post("/add", verifyUser, addProject);

// Get project by Id
router.post("/get/:id", verifyUser, getProjectById);

//  Get all projects
router.post("/all", verifyUser, getAllProjectsByUser);

// Update a project by Id
router.post("/update/:id", verifyUser, updateProject);

// Delete a project by Id
router.post("/delete/:id", verifyUser, deleteProject);
router.post("/member", verifyUser, getProjectsAsMember);
router.post("/projects/all", verifyUser, getAllUserProjects);
module.exports = router;
