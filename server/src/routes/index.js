const router = require("express")?.Router();
//Project route
router.use("/project", require("./project.route.js"));
//Task route
router.use("/task", require("./task.route.js"));
//Status route
router.use("/status", require("./status.route.js"));
//User route
router.use("/user", require("./user.route.js"));

module.exports = router;
