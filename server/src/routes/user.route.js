const router = require("express")?.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");

const {
  registerUser,
  loginUser,
  logOutUser,
  getUserBySearch,
} = require("../controllers/user.controller.js");
const validateUser = require("../middlewares/validateUser.middleware.js");

// Register a new user
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUser, logOutUser);
router.post("/:id", verifyUser, logOutUser);
router.post("/search/:term", verifyUser, getUserBySearch);
router.post("/validate", validateUser);

module.exports = router;
