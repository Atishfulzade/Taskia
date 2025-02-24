const router = require("express")?.Router();

const {
  addProject,
  updateProject,
  getAllProjects,
  getProjectById,
  deleteProject,
} = require("../controllers/project.controller.js");

//Add new project
router.post("/add", addProject);

// Get project by Id
router.post("/get/:id", getProjectById);

//  Get all projects
router.post("/all", getAllProjects);

// Update a project by Id
router.post("/update/:id", updateProject);

// Delete a project by Id
router.post("/delete/:id", deleteProject);

module.exports = router;
