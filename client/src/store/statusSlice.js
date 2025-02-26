import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  statuses: [], // Changed 'status' to 'statuses' for better clarity
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setStatuses: (state, action) => {
      state.statuses = action.payload; // Store fetched statuses
    },
    addStatus: (state, action) => {
      state.statuses.push(action.payload);
    },
    deleteStatus: (state, action) => {
      state.statuses = state.statuses.filter(
        (status) => status._id !== action.payload
      );
    },
    updateStatus: (state, action) => {
      const updatedStatus = state.statuses.find(
        (status) => status._id === action.payload._id
      );
      if (updatedStatus) {
        updatedStatus.name = action.payload.name;
      }
    },
  },
});

export const { setStatuses, addStatus, deleteStatus, updateStatus } =
  statusSlice.actions;

export default statusSlice.reducer;
