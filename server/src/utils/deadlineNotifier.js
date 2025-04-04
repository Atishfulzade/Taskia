import cron from "node-cron";
import { renderDeadlineEmail } from "../emails/DeadlineNotification.jsx";
import Task from "../models/task.model.js";
import emailSender from "./emailSender.js";

// Run every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  const approachingDeadlines = await Task.find({
    dueDate: {
      $gte: new Date(), // Deadline is in the future
      $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Within 3 days
    },
    notified: false, // Ensure we don't notify repeatedly
  });

  for (const task of approachingDeadlines) {
    // Send email to assignees
    const emailHTML = renderDeadlineEmail({
      resourceType: "task",
      resourceTitle: task.title,
      shareLink: `{process.env.CLIENT_URL}/tasks/${task.customId}`,
      permission: "view",
      senderName: "System Notification",
    });

    await emailSender({
      to: task.assignee.email,
      subject: `Deadline Approaching: ${task.title}`,
      html: emailHTML,
    });

    // Mark as notified to avoid duplicates
    task.notified = true;
    await task.save();
  }
});
