import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  statuses: [],
};

const statusSlice = createSlice({
  name: "status",
  initialState,
  reducers: {
    setStatuses: (state, action) => {
      state.statuses = action.payload;
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
      state.statuses = state.statuses.map((status) =>
        status._id === action.payload._id
          ? { ...status, ...action.payload }
          : status
      );
    },
  },
});

export const { setStatuses, addStatus, deleteStatus, updateStatus } =
  statusSlice.actions;

export default statusSlice.reducer;
