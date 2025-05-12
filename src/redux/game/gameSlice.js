import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const gameInitialState = {
  isCreatingGame: false,
  currentDeckId: null,
  activeActions: {},
  activeActionsTest: {},

  selectedDeckIds: [], // для відстеження обраних колод
  userSelectedDeckIds: [], // для збереження вибору користувача
  cycleState: 0, // для відстеження циклу CHECKED_ALL -> CHECKED_NONE -> CHECKED_USER
  internetStatus: null,
};

export const gameSlice = createSlice({
  name: "gameSlice",
  initialState: gameInitialState,
  reducers: {
    setIsCreatingGame: (state, action) => {
      state.isCreatingGame = action.payload;
    },

    setCurrentDeckId: (state, action) => {
      state.currentDeckId = action.payload;
    },

    setSelectedDeckIds: (state, action) => {
      state.selectedDeckIds = action.payload;
    },

    setUserSelectedDeckIds: (state, action) => {
      state.userSelectedDeckIds = action.payload;
    },

    setCycleState: (state, action) => {
      state.cycleState = action.payload;
    },

    clearGameInitialState: () => gameInitialState,

    setActiveAction(state, action) {
      const { key, value } = action.payload;
      state.activeActions[key] = value;
    },

    clearActiveAction(state, action) {
      delete state.activeActions[action.payload];
    },

    setActiveActionTest(state, action) {
      const { key, value } = action.payload;
      state.activeActionsTest[key] = value;
    },

    clearActiveActionTest(state, action) {
      delete state.activeActionsTest[action.payload];
    },

    setNetworkStatus(state, action) {
      state.internetStatus = action.payload;
    },
  },
});

const persistConfig = {
  key: "gameSlice",
  storage,
};

export const persistedGameReducer = persistReducer(
  persistConfig,
  gameSlice.reducer,
);

export const {
  setIsCreatingGame,
  setCurrentDeckId,
  setSelectedDeckIds,
  setUserSelectedDeckIds,
  setCycleState,
  clearGameInitialState,
  setActiveAction,
  clearActiveAction,
  setActiveActionTest,
  clearActiveActionTest,
  setNetworkStatus,
} = gameSlice.actions;
