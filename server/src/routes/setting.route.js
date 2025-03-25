const express = require("express");
const router = express.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");
const {
  getSetting,
  manageSetting,
  updateSetting,
  deleteSetting,
} = require("../controllers/setting.controller.js");

// Get settings for the current user
router.post("/get", verifyUser, getSetting);

// Create or update settings
router.post("/create", verifyUser, manageSetting);

// Update a specific setting by ID
router.post("/update/:id", verifyUser, updateSetting);

// Delete a setting
router.post("/delete/:id", verifyUser, deleteSetting);

module.exports = router;
