// store/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: true,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    setSidebarOpen: (state, action) => {
      state.open = action.payload;
    },
    toggleSidebar: (state) => {
      state.open = !state.open;
    },
  },
});

export const { setSidebarOpen, toggleSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
