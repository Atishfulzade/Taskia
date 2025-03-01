import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import projectReducer from "./projectSlice";
import statusReducer from "./statusSlice";
import taskReducer from "./taskSlice";
import assignTaskSlice from "./assignTaskSlice";
// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("user");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    localStorage.setItem("user", JSON.stringify(state));
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
  },
  preloadedState: { user: loadState() },
});

store.subscribe(() => saveState(store.getState().user));

export default store;
