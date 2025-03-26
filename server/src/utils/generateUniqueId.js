// utils/generateUniqueId.js
import mongoose from "mongoose";

// Database counters model
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 },
});
const Counter = mongoose.model("Counter", counterSchema);

/**
 * Generates unique IDs for projects and tasks with auto-incrementing numbers
 * @param {Object} options - Configuration options
 * @param {string} options.type - 'project' or 'task'
 * @param {string} options.name - Project name or user name
 * @param {string} [options.projectInitials] - Required for task IDs
 * @returns {Promise<string>} Generated unique ID
 */
export async function generateUniqueId({ type, name, projectInitials }) {
  // Validate input
  if (!["project", "task"].includes(type)) {
    throw new Error('Invalid type. Must be "project" or "task"');
  }

  // Generate initials
  const getInitials = (str, maxLength = 3) => {
    return str
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0].toUpperCase())
      .join("")
      .substring(0, maxLength);
  };

  // Determine prefix based on type
  let prefix;
  if (type === "project") {
    prefix = getInitials(name); // User name initials for projects
  } else {
    if (!projectInitials)
      throw new Error("Project initials required for task IDs");
    prefix = `${getInitials(projectInitials, 2)}T`; // Project initials + 'T' for tasks
  }

  // Get or create and increment the counter
  const counterId = `${type}_${prefix}`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // Format the sequential number (4 digits for tasks, 6 for projects)
  const digitLength = type === "project" ? 6 : 4;
  const sequentialNumber = counter.seq.toString().padStart(digitLength, "0");

  return `${prefix}-${sequentialNumber}`;
}

// Example usage:
// For projects: await generateUniqueId({ type: 'project', name: 'John Doe' })
// For tasks: await generateUniqueId({ type: 'task', name: 'Task Name', projectInitials: 'PRJ' })
