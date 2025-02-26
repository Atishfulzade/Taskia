import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  projects: [], // Stores all projects
  currentProject: null, // Stores the current project
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
    },
  },
});

export const { setProjects, setCurrentProject } = projectSlice.actions;

export default projectSlice.reducer;
