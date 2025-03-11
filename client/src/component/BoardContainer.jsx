import React, { useState, useMemo, lazy, Suspense } from "react";
import {
  DndContext,
  closestCorners,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useDispatch } from "react-redux";
import { updateTask, addTask } from "../store/taskSlice";
import requestServer from "../utils/requestServer";

import Column from "../component/Column";
import TaskItem from "../component/TaskItem";
const AddTaskPopup = lazy(() => import("../component/AddTaskPopup"));

const BoardContainer = ({ projectId, statuses, tasks, isLoading }) => {
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [editStatus, setEditStatus] = useState(null);
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  // Redux
  const dispatch = useDispatch();

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Find the status for the active task
  const activeTaskStatus = useMemo(() => {
    if (!activeTask) return null;
    return statuses.find((status) => status._id === activeTask.status);
  }, [activeTask, statuses]);

  // Task Management
  const handleEditTask = (task, status) => {
    setEditTask(task);
    setEditStatus(status);
    setShowTaskPopup(true);
  };

  const handleAddNewTask = (statusId) => {
    setEditTask(null);
    setEditStatus(statuses.find((status) => status._id === statusId));
    setShowTaskPopup(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    const draggedTask = tasks.find((task) => task._id === active.id);
    setActiveTask(draggedTask);
  };
  console.log("editTask", editTask);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    const updatedTask = tasks.find((task) => task._id === taskId);
    if (updatedTask && updatedTask.status !== newStatus) {
      const taskWithNewStatus = { ...updatedTask, status: newStatus };

      // Update Redux store
      dispatch(updateTask(taskWithNewStatus));

      // Update task on the server
      try {
        await requestServer(`task/update/${taskId}`, { status: newStatus });
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const handleTaskCreate = async (taskData) => {
    try {
      const response = await requestServer("task/create", {
        ...taskData,
        projectId,
      });

      if (response.data) {
        dispatch(addTask(response.data));
      }

      setShowTaskPopup(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleTaskUpdate = async (taskData) => {
    try {
      const response = await requestServer(
        `task/update/${editTask._id}`,
        taskData
      );

      if (response.data) {
        dispatch(updateTask(response.data));
      }

      setShowTaskPopup(false);
      setEditTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {statuses.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="dark:text-white">
            No statuses found. Add a status to get started.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 px-6">
          {statuses.map((status) => (
            <Column
              key={status._id}
              status={status}
              tasks={tasks.filter((task) => task.status === status._id)}
              isLoading={isLoading}
              onAddTask={() => handleAddNewTask(status._id)}
              onEditTask={handleEditTask}
            />
          ))}
        </div>
      )}

      {/* Task Edit/Create Popup */}
      {showTaskPopup && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddTaskPopup
            open={showTaskPopup}
            onOpenChange={setShowTaskPopup} // Ensure this is a function
            taskData={editTask}
            status={editStatus}
            projectId={projectId}
            onCreateTask={handleTaskCreate}
            onUpdateTask={handleTaskUpdate}
            isEdit={!!editTask}
          />{" "}
        </Suspense>
      )}

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <TaskItem
            task={activeTask}
            status={activeTaskStatus}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default BoardContainer;
