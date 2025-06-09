import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  item_name: true,
  category: true,
  brand: true,
  size: true,
  available_box: true,
  box: true,
  piece: true,
};

const columnVisibilitySlice = createSlice({
  name: "columnVisibility",
  initialState,
  reducers: {
    toggleColumn: (state, action) => {
      const column = action.payload;
      if (column in state) {
        state[column] = !state[column];
      }
    },
    setColumnVisibility: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetColumns: () => initialState,
  },
});

export const { toggleColumn, setColumnVisibility, resetColumns } =
  columnVisibilitySlice.actions;

export default columnVisibilitySlice.reducer;
