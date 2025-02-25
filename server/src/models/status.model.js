const mongoose = require("mongoose");
const Project = require("./project.model.js");

const colorSchema = new mongoose.Schema({
  primaryColor: String,
  secondaryColor: String,
});

const statusSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Link to the Project model
      required: true,
    },
    color: colorSchema, // Embedded color schema
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

const Status = mongoose.model("Status", statusSchema);

module.exports = Status;
