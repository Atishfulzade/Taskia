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
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

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
