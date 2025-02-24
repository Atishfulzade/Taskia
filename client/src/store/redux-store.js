import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("userState");
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    localStorage.setItem("userState", JSON.stringify(state));
  } catch (err) {
    console.error("Error saving state", err);
  }
};

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: { user: loadState() },
});

store.subscribe(() => saveState(store.getState().user));

export default store;
