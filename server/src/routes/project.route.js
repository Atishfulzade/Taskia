const router = require("express")?.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");
const {
  addProject,
  updateProject,
  getAllProjects,
  getProjectById,
  deleteProject,
} = require("../controllers/project.controller.js");

//Add new project
router.post("/add", verifyUser, addProject);

// Get project by Id
router.post("/get/:id", verifyUser, getProjectById);

//  Get all projects
router.post("/all", verifyUser, getAllProjects);

// Update a project by Id
router.post("/update/:id", verifyUser, updateProject);

// Delete a project by Id
router.post("/delete/:id", verifyUser, deleteProject);

module.exports = router;
