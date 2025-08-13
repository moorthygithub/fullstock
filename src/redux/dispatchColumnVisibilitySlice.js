// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   print: false,
// };

// const dispatchColumnVisibilitySlice = createSlice({
//   name: "dispatchColumnVisibility",
//   initialState,
//   reducers: {
//     toggleDispatchColumn: (state, action) => {
//       const column = action.payload;
//       if (typeof state[column] == "boolean") {
//         state[column] = !state[column];
//       }
//     },
//     setDispatchColumnVisiblity: (state, action) => {
//       return { ...state, ...action.payload };
//     },
//     resetColumns: () => initialState,
//   },
// });

// export const {
//   toggleDispatchColumn,
//   setDispatchColumnVisiblity,
//   resetColumns,
// } = dispatchColumnVisibilitySlice.actions;

// export default dispatchColumnVisibilitySlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dispatchimage: false,
  prebookimage: false,
};

const dispatchColumnVisibilitySlice = createSlice({
  name: "dispatchColumnVisibility",
  initialState,
  reducers: {
    toggleDispatchColumn: (state, action) => {
      const column = action.payload;
      if (typeof state[column] === "boolean") {
        state[column] = !state[column];
      }
    },
    setDispatchColumnVisiblity: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetColumns: () => initialState,
  },
});

export const {
  toggleDispatchColumn,
  setDispatchColumnVisiblity,
  resetColumns,
} = dispatchColumnVisibilitySlice.actions;

export default dispatchColumnVisibilitySlice.reducer;
