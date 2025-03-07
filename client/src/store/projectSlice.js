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
    setDeleteProject: (state, action) => {
      const projectId = action.payload;
      // Remove the project from the projects array
      state.projects = state.projects.filter(
        (project) => project._id !== projectId
      );
      // If the deleted project is the current project, reset currentProject
      if (state.currentProject?._id === projectId) {
        state.currentProject = null;
      }
    },
    updateProject: (state, action) => {
      const updatedProject = action.payload; // The updated project object
      // Find the index of the project to update
      const index = state.projects.findIndex(
        (project) => project._id === updatedProject._id
      );
      if (index !== -1) {
        // Update the project in the projects array
        state.projects[index] = updatedProject;
        // If the updated project is the current project, update it as well
        if (state.currentProject?._id === updatedProject._id) {
          state.currentProject = updatedProject;
        }
      }
    },
  },
});

export const {
  setProjects,
  setCurrentProject,
  setDeleteProject,
  updateProject,
} = projectSlice.actions;

export default projectSlice.reducer;
