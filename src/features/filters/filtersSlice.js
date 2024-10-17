import { createSlice } from "@reduxjs/toolkit";

const filtersInitialState = {
  status: "",

  // при роботі з constants.js: status:
  // import { statusFilters } from "./constants";
  // statusFilters.all,
};

export const filtersSlice = createSlice({
  name: "filters",
  initialState: filtersInitialState,
  reducers: {
    setFilter(state, action) {
      state.status = action.payload;
    },
  },
});

export const { setFilter } = filtersSlice.actions;
