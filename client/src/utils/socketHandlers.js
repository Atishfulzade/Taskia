import { toast } from "sonner";
import { addTask, updateTask, deleteTask } from "../store/taskSlice";
import { addStatus, updateStatus, deleteStatus } from "../store/statusSlice";
import { addAssignTask } from "../store/assignTaskSlice";
import { setDeleteProject, updateProject } from "../store/projectSlice";
import {
  addSharedProject,
  removeSharedProject,
  updateSharedProject,
} from "@/store/sharedProjectSlice";
import requestServer from "./requestServer";

// Keep track of initialized socket to prevent duplicate event listeners
let isInitialized = false;

export const initializeSocketHandlers = (socket, dispatch) => {
  if (!socket || isInitialized) {
    console.log("Socket handlers already initialized or socket not available");
    return;
  }

  console.log("Initializing socket event handlers...");

  // Clean up previous listeners to prevent duplicates
  removeAllHandlers(socket);

  isInitialized = true;

  // Test connection
  socket.on("testConnection", (data) => {
    console.log("Socket connection test:", data);
  });

  // Status events
  socket.on("statusCreated", (data) => {
    console.log("Status Created:", data);
    if (data.newStatus) {
      dispatch(addStatus(data.newStatus));
    }
  });

  socket.on("statusUpdated", (data) => {
    console.log("Status Updated:", data);
    if (data.updatedStatus) {
      dispatch(updateStatus(data.updatedStatus));
    }
  });

  socket.on("statusDeleted", (data) => {
    console.log("Status Deleted:", data);
    if (data.statusId) {
      dispatch(deleteStatus(data.statusId));
    }
  });

  // Task events with notifications
  socket.on("taskCreated", async (data) => {
    console.log("Task Created from socket:", data);
    if (data.task) {
      // Check if task is already in store (prevents duplicates)
      dispatch(addTask(data.task));
      toast.success(data.message || "New task created");

      // Send notification
      try {
        await requestServer("user/notification/add", {
          userId: data.task.userId,
          title: `Task Created: ${data.task.title}`,
          type: "info",
        });
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
    }
  });

  socket.on("taskUpdated", async (data) => {
    console.log("Task Updated:", data);
    if (data.updatedTask) {
      dispatch(updateTask(data.updatedTask));
      toast.success(data.message || "Task updated");

      // Send notification
      await requestServer("user/notification/add", {
        userId: data.updatedTask.userId,
        title: data.message,
        type: "info",
      });
    }
  });

  socket.on("taskDeleted", async (data) => {
    console.log("Task Deleted:", data);
    if (data.taskId) {
      dispatch(deleteTask(data.taskId));
      toast.success(data.message || "Task deleted");

      // Send notification
      await requestServer("user/notification/add", {
        userId: data.userId,
        title: data.message,
        type: "info",
      });
    }
  });

  socket.on("taskAssigned", async (data) => {
    console.log("Task Assigned:", data);
    if (data.newTask) {
      dispatch(addAssignTask(data.newTask));
      toast.success(data.message || "New task assigned to you");

      // Send notification
      await requestServer("user/notification/add", {
        userId: data.newTask.userId,
        title: data.message,
        type: "info",
      });
    } else if (data.updatedTask) {
      dispatch(updateTask(data.updatedTask));
      toast.success(data.message || "Task assigned to you");

      // Send notification
      await requestServer("user/notification/add", {
        userId: data.updatedTask.userId,
        title: data.message,
        type: "info",
      });
    }
  });

  // Project events with notifications
  socket.on("projectUpdated", async (data) => {
    console.log("Project Updated:", data);
    if (data.project) {
      dispatch(updateSharedProject(data.project));
      toast.success(data.message || "Project updated");

      // Send notification
      await requestServer("user/notification/add", {
        userId: data.project.userId,
        title: data.message,
        type: "info",
      });
    }
  });

  socket.on("projectDeleted", async (data) => {
    console.log("Project Deleted:", data);
    if (data.projectId) {
      dispatch(removeSharedProject(data.projectId));
      toast.success(data.message || "Project has been deleted");

      // Send notification
      await requestServer("user/notification/add", {
        title: data.message,
        type: "info",
      });
    }
  });

  // Error handling
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    toast.error("Connection error. Please try again.");
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error);
    toast.error("An error occurred with the real-time connection");
  });
};

// Reset the initialization state - useful for testing and debugging
function removeAllHandlers(socket) {
  const events = [
    "testConnection",
    "statusCreated",
    "statusUpdated",
    "statusDeleted",
    "taskCreated",
    "taskUpdated",
    "taskDeleted",
    "taskAssigned",
    "projectUpdated",
    "projectDeleted",
  ];

  events.forEach((event) => socket.off(event));
}

// Reset the initialization state - useful for testing and debugging
export const resetSocketHandlers = () => {
  isInitialized = false;
};

export const joinProjectRoom = (socket, projectId) => {
  if (!socket || !projectId) return;

  const roomId = `project:${projectId}`;
  socket.emit("joinRoom", { roomId });
  console.log(`Joining project room: ${roomId}`);
};

export const leaveProjectRoom = (socket, projectId) => {
  if (!socket || !projectId) return;

  const roomId = `project:${projectId}`;
  socket.emit("leaveRoom", { roomId });
  console.log(`Leaving project room: ${roomId}`);
};
