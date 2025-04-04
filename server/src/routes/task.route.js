const router = require("express").Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");
const checkTaskAccess = require("../middlewares/checkTaskAccess.middleware.js");
// const optionalAuth = require("../middlewares/optionalAuth.middleware.js");

const taskController = require("../controllers/task.controller.js");

// Authenticated routes
router.post("/add", verifyUser, taskController.addTask);
router.post("/all/:id", verifyUser, taskController.getAllTask);
router.post("/update/:id", verifyUser, taskController.updateTask);
router.post("/delete/:id", verifyUser, taskController.deleteTask);
router.post("/assign", verifyUser, taskController.getTasksForUser);
router.post("/t/:id", verifyUser, taskController.getTaskById);

// Share functionality
router.post("/:id/share-links", verifyUser, taskController.addShareLink);
router.post("/:id/collaborators", verifyUser, taskController.addCollaborator);

// Shared access routes (with optional authentication)
router.get(
  "/shared/:taskId",
  // optionalAuth,
  checkTaskAccess,
  taskController.sharedLinkTaskAccess
);

module.exports = router;
