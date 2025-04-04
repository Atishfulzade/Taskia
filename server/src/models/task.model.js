const mongoose = require("mongoose");
const Status = require("./status.model.js");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    customId: { type: String },

    priority: {
      type: String,
      enum: ["No", "Medium", "High"],
      default: "No",
    },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Status,
      required: true,
    },
    dueDate: Date,
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shareLinks: [
      {
        link: String,
        permission: { type: String, enum: ["view", "edit"] }, // Make sure this exists
        expiresAt: Date,
        isActive: { type: Boolean, default: true },
      },
    ],
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    collaborators: [
      {
        email: String,
        permission: { type: String, enum: ["view", "edit"] },
      },
    ],
    subTask: [
      {
        title: String,
        description: String,
      },
    ],
    attachedFile: [{ fileName: String, link: String }],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
