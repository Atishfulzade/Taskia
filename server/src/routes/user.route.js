const router = require("express")?.Router();
const {
  registerUser,
  loginUser,
} = require("../controllers/user.controller.js");

// Register a new user
router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
