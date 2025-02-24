const router = require("express")?.Router();

const {
  addStatus,
  deleteStatus,
  getAllStatus,
} = require("../controllers/status.controller.js");

// Add a new status
router.post("/add", addStatus);

// Get a status by projectId
router.post("/all/:id", getAllStatus);

//  Delete a project by Id
router.post("/delete/:id", deleteStatus);

module.exports = router;
