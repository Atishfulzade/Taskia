const router = require("express")?.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");
const checkTaskAccess = require("../middlewares/checkTaskAccess.middleware.js");

const taskController = require("../controllers/task.controller.js");

// POST: Add a new task to a project
router.post("/add", verifyUser, taskController.addTask);

// GET: Get all tasks for a project by ID
router.post("/all/:id", verifyUser, taskController.getAllTask);

// POST: Update a task by ID
router.post("/update/:id", verifyUser, taskController.updateTask);

// DELETE: Delete a task by ID
router.post("/delete/:id", verifyUser, taskController.deleteTask);

// get tasks assigned to a user
router.post("/assign", verifyUser, taskController.getTasksForUser);
router.post(
  "/id/:taskId",
  checkTaskAccess,
  taskController.sharedLinkTaskAccess
);

//get specific tasks assigned to a user
router.post("/t/:id", verifyUser, taskController.getTaskById);
router.post("/:id/share-links", verifyUser, taskController.addShareLink);

module.exports = router;
