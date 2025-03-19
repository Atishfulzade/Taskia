import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  sharedProject: [],
};
const SharedProjectSlice = createSlice({
  name: "sharedproject",
  initialState,
  reducers: {
    setSharedProjects: (state, action) => {
      state.sharedProject = action.payload;
    },
    addSharedProject: (state, action) => {
      state.sharedProject.push(action.payload);
    },
    updateSharedProject: (state, action) => {
      const updateSharedProject = action.payload;
      const index = state.sharedProject.findIndex(
        (project) => project._id === updateSharedProject._id
      );
      if (index !== -1) {
        state.sharedProject[index] = updateSharedProject;
      }
    },
    removeSharedProject: (state, action) => {
      state.sharedProject = state.sharedProject.filter(
        (project) => project._id !== action.payload
      );
    },
  },
});

export const {
  setSharedProjects,
  updateSharedProject,
  addSharedProject,
  removeSharedProject,
} = SharedProjectSlice.actions;

export default SharedProjectSlice.reducer;
