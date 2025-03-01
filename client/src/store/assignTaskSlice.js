import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
};

const assignTaskSlice = createSlice({
  name: "assignTask",
  initialState,
  reducers: {
    setAssignTasks: (state, action) => {
      state.tasks = action.payload; // Store fetched statuses
    },
    addAssignTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    deleteAssignTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task._id !== action.payload);
    },
    updateAssignTask: (state, action) => {
      const updatedTask = action.payload;
      state.tasks = state.tasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      );
    },
  },
});

export const {
  addAssignTask,
  deleteAssignTask,
  updateAssignTask,
  setAssignTasks,
} = assignTaskSlice.actions;

export default assignTaskSlice.reducer;
