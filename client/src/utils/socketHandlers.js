import { toast } from "sonner";
import { addTask, updateTask, deleteTask } from "../store/taskSlice";
import { addStatus, updateStatus, deleteStatus } from "../store/statusSlice";
import { addAssignTask } from "../store/assignTaskSlice";
import { setDeleteProject, updateProject } from "../store/projectSlice";
import { addSharedProject } from "@/store/sharedProjectSlice";

// Keep track of initialized socket to prevent duplicate event listeners
let isInitialized = false;

export const initializeSocketHandlers = (socket, dispatch) => {
  if (!socket || isInitialized) {
    return;
  }

  console.log("Initializing socket event handlers...");
  isInitialized = true;

  // Cleanup previous listeners before adding new ones
  socket.off("testConnection");
  socket.off("statusCreated");
  socket.off("statusUpdated");
  socket.off("statusDeleted");
  socket.off("taskCreated");
  socket.off("taskUpdated");
  socket.off("taskDeleted");
  socket.off("taskAssigned");
  socket.off("projectUpdated");
  socket.off("projectInvitation");
  socket.off("projectDeleted");

  // Test connection
  socket.on("testConnection", (data) => {
    console.log("Socket connection test:", data);
    toast.success(data.message || "WebSocket connected");
  });

  // Status events
  socket.on("statusCreated", (data) => {
    console.log("Status Created:", data);
    if (data.newStatus) {
      dispatch(addStatus(data.newStatus));
      toast.success(data.message || "New status created");
    }
  });

  socket.on("statusUpdated", (data) => {
    console.log("Status Updated:", data);
    if (data.updatedStatus) {
      dispatch(updateStatus(data.updatedStatus));
      toast.success(data.message || "Status updated");
    }
  });

  socket.on("statusDeleted", (data) => {
    console.log("Status Deleted:", data);
    if (data.statusId) {
      dispatch(deleteStatus(data.statusId));
      toast.success(data.message || "Status deleted");
    }
  });

  // Task events
  socket.on("taskCreated", (data) => {
    console.log("Task Created from socket:", data);
    if (data.task) {
      dispatch(addTask(data.task));
      toast.success(data.message || "New task created");
    }
  });

  socket.on("taskUpdated", (data) => {
    console.log("Task Updated:", data);
    if (data.updatedTask) {
      dispatch(updateTask(data.updatedTask));
      toast.success(data.message || "Task updated");
    }
  });

  socket.on("taskDeleted", (data) => {
    console.log("Task Deleted:", data);
    if (data.taskId) {
      dispatch(deleteTask(data.taskId));
      toast.success(data.message || "Task deleted");
    }
  });

  socket.on("taskAssigned", (data) => {
    console.log("Task Assigned:", data);
    if (data.newTask) {
      dispatch(addAssignTask(data.newTask));
      toast.success(data.message || "New task assigned to you");
    } else if (data.updatedTask) {
      dispatch(updateTask(data.updatedTask));
      toast.success(data.message || "Task assigned to you");
    }
  });

  // Project events
  socket.on("projectUpdated", (data) => {
    console.log("Project Updated:", data);
    if (data.project) {
      dispatch(updateProject(data.project));
      toast.success(data.message || "Project updated");
    }
  });

  socket.on("projectInvitation", (data) => {
    console.log("Project Invitation:", data);
    if (data.newProject) {
      dispatch(addSharedProject(data.newProject));
      toast.success(data.message || "You've been invited to a project");
    }
  });

  socket.on("projectDeleted", (data) => {
    console.log("Project Deleted:", data);
    if (data.projectId) {
      dispatch(setDeleteProject(data.projectId));
      toast.success(data.message || "Project has been deleted");
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

//Reset the initialization state - useful for testing and debugging

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
