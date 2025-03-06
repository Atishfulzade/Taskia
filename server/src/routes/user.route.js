const router = require("express")?.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");

const {
  registerUser,
  loginUser,
  logOutUser,
  getAllUser,
  getUserById,
} = require("../controllers/user.controller.js");
const validateUser = require("../middlewares/validateUser.middleware.js");

// Register a new user
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUser, logOutUser);
router.post("/search/:term", verifyUser, getAllUser);
router.post("/validate", verifyUser, validateUser);
router.post("/u/:id", verifyUser, getUserById);

module.exports = router;
