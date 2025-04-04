const emailSender = require("../utils/emailSender");
const Project = require("../models/project.model.js"); // Make sure to import your Project model

const router = require("express").Router();

// Project route
router.use("/project", require("./project.route"));
// Task route
router.use("/task", require("./task.route"));
// Status route
router.use("/status", require("./status.route"));
// User route
router.use("/user", require("./user.route"));
// Setting route
router.use("/setting", require("./setting.route"));

// Backend routes
router.post("/last-id", async (req, res) => {
  try {
    const lastProject = await Project.findOne().sort("-customId");
    const lastId = lastProject?.customId?.split("-")[1] || 0;
    res.json({ lastId: parseInt(lastId) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch last ID" });
  }
});

router.post("/mail", async (req, res) => {
  const { to, subject, text, html } = req.body;

  // Validate required fields
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Missing required email fields" });
  }

  // Ensure 'to' is an array
  const recipients = Array.isArray(to) ? to : [to];

  // Validate all email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const invalidEmails = recipients.filter((email) => !emailRegex.test(email));

  if (invalidEmails.length > 0) {
    return res.status(400).json({
      error: "Invalid email addresses",
      invalidEmails,
    });
  }

  try {
    const sendPromises = recipients.map((email) =>
      emailSender({
        to: email,
        subject,
        text: text || "Please view this email in an HTML capable client",
        html,
      })
    );

    await Promise.all(sendPromises);
    res.json({
      message: "Emails sent successfully",
      count: recipients.length,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      error: "Failed to send email(s)",
      details: error.message,
    });
  }
});

module.exports = router;
