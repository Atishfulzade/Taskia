import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import projectReducer from "./projectSlice";
import statusReducer from "./statusSlice";
import taskReducer from "./taskSlice";
import assignTaskSlice from "./assignTaskSlice";
import sharedProjectReducer from "./sharedProjectSlice";
import { debounce } from "lodash";

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("reduxState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("reduxState", serializedState);
  } catch (err) {
    console.error("Error saving state", err);
  }
};

const store = configureStore({
  reducer: {
    user: userReducer,
    project: projectReducer,
    status: statusReducer,
    task: taskReducer,
    assignTask: assignTaskSlice,
    sharedproject: sharedProjectReducer,
  },
  preloadedState: loadState(), // Load the entire state
});

// Debounce the saveState function to improve performance
const debouncedSaveState = debounce((state) => {
  saveState(state);
}, 1000);

store.subscribe(() => debouncedSaveState(store.getState()));

export default store;
