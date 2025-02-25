const router = require("express")?.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");
const {
  addStatus,
  updateStatus,
  deleteStatus,
  getAllStatus,
} = require("../controllers/status.controller.js");

// Add a new status
router.post("/add", verifyUser, addStatus);

// Get a status by projectId
router.post("/all/:id", verifyUser, getAllStatus);

//  Delete a project by Id
router.post("/delete/:id", verifyUser, deleteStatus);
router.post("/update/:id", verifyUser, updateStatus);

module.exports = router;
