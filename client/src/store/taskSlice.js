import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload; // Store fetched statuses
    },
    addTask: (state, action) => {
      // Check if task already exists in the store
      const exists = state.tasks.some(
        (task) => task._id === action.payload._id
      );
      if (!exists) {
        state.tasks.push(action.payload);
      } else {
        console.log(
          `Task ${action.payload._id} already exists in store, skipping add`
        );
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((task) => task._id !== action.payload);
    },
    updateTask: (state, action) => {
      const updatedTask = action.payload;
      state.tasks = state.tasks.map((task) =>
        task._id === updatedTask._id ? updatedTask : task
      );
    },
  },
});

export const { addTask, deleteTask, setTasks, updateTask } = taskSlice.actions;

export default taskSlice.reducer;
