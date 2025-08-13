import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  box: true,
};

const categoryColumnVisibilitySlice = createSlice({
  name: "categoryColumnVisibility",
  initialState,
  reducers: {
    toggleCategoryColumn: (state, action) => {
      const column = action.payload;
      if (typeof state[column] == "boolean") {
        state[column] = !state[column];
      }
    },
    setCategoryColumnVisiblity: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetColumns: () => initialState,
  },
});

export const {
  toggleCategoryColumn,
  setCategoryColumnVisiblity,
  resetColumns,
} = categoryColumnVisibilitySlice.actions;

export default categoryColumnVisibilitySlice.reducer;
