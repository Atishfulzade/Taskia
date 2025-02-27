const router = require("express")?.Router();
const { verifyUser } = require("../middlewares/verifyUser.middleware.js");

const {
  registerUser,
  loginUser,
  logOutUser,
} = require("../controllers/user.controller.js");

// Register a new user
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUser, logOutUser);
router.post("/:id", verifyUser, logOutUser);
router.post("/:search", verifyUser, logOutUser);

module.exports = router;
