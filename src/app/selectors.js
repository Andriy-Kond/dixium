export const selectUserIsLoggedIn = state => state.authSlice.isLoggedIn;
export const selectUserToken = state => state.authSlice.userToken;
export const selectIsCreatingGame = state => state.gameSlice.isCreatingGame;

export const selectGameDeckId = state => state.gameSlice.gameDeckId;
