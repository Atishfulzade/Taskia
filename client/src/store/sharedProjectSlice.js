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
    removeSharedProject: (state, action) => {
      state.sharedProject = state.sharedProject.filter(
        (project) => project._id !== action.payload
      );
    },
  },
});

export const { setSharedProjects, addSharedProject, removeSharedProject } =
  SharedProjectSlice.actions;

export default SharedProjectSlice.reducer;
