const mongoose = require("mongoose");
const Status = require("./status.model.js");

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    status: { type: mongoose.Schema.ObjectId, ref: Status, required: true },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
