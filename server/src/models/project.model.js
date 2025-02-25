const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isPrivate: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
