const router = require("express")?.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");

const {
  addTask,
  updateTask,
  deleteTask,
  getAllTask,
  getTaskById,
  getTasksForUser,
} = require("../controllers/task.controller.js");

// POST: Add a new task to a project
router.post("/add", verifyUser, addTask);

// GET: Get all tasks for a project by ID
router.post("/all/:id", verifyUser, getAllTask);

// POST: Update a task by ID
router.post("/update/:id", verifyUser, updateTask);

// DELETE: Delete a task by ID
router.post("/delete/:id", verifyUser, deleteTask);

// get tasks assigned to a user
router.post("/assign", verifyUser, getTasksForUser);

//get specific tasks assigned to a user
router.post("/t/:id", verifyUser, getTaskById);

module.exports = router;
