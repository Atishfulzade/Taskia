const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Status = mongoose.model("Status", statusSchema);
module.exports = Status;
