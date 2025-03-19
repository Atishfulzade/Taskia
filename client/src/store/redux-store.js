import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import projectReducer from "./projectSlice";
import statusReducer from "./statusSlice";
import taskReducer from "./taskSlice";
import assignTaskSlice from "./assignTaskSlice";
import sharedProjectReducer from "./sharedProjectSlice";
import { debounce } from "lodash";

// Load state from localStorage (only user data)
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("userState");
    return serializedState ? { user: JSON.parse(serializedState) } : undefined;
  } catch (err) {
    return undefined;
  }
};

// Save only user data to localStorage
const saveState = (state) => {
  try {
    const userState = JSON.stringify(state.user); // Store only user data
    localStorage.setItem("userState", userState);
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
  preloadedState: loadState(), // Load only user state
});

// Debounce the saveState function to improve performance
const debouncedSaveState = debounce((state) => {
  saveState(state);
}, 1000);

store.subscribe(() => debouncedSaveState(store.getState()));

export default store;
