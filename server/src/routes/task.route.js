const router = require("express")?.Router();

const {
  addTask,
  updateTask,
  deleteTask,
  getAllTask,
} = require("../controllers/task.controller.js");

// POST: Add a new task to a project
router.post("/add", addTask);

// GET: Get all tasks for a project by ID
router.post("/all/:id", getAllTask);

// POST: Update a task by ID
router.post("/update/:id", updateTask);

// DELETE: Delete a task by ID
router.post("/delete/:id", deleteTask);

module.exports = router;
