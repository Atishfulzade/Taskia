const router = require("express")?.Router();
//Project route
router.use("/project", require("./project.route.js"));
//Task route
router.use("/task", require("./task.route.js"));
//Status route
router.use("/status", require("./status.route.js"));
//User route
router.use("/user", require("./user.route.js"));

// Setting route
router.use("/setting", require("./setting.route.js"));
// Backend route
router.post("/last-id", async (req, res) => {
  const lastProject = await Project.findOne().sort("-customId");
  const lastId = lastProject?.customId?.split("-")[1] || 0;
  res.json({ lastId: parseInt(lastId) });
});

module.exports = router;
