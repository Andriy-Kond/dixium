// authSlice:
export const selectUserIsLoggedIn = state => state.authSlice.isLoggedIn;
export const selectUserToken = state => state.authSlice.userToken;
export const selectUserCredentials = state => state.authSlice.user;

// gameSlice:
export const selectIsCreatingGame = state => state.gameSlice.isCreatingGame;
export const selectCurrentDeckId = state => state.gameSlice.currentDeckId;
export const selectActiveActions = state => state.gameSlice.activeActions;

//# якщо games - це об'єкт:
export const selectGame = currentGameId => state =>
  state.gameSlice.games[currentGameId];
//# якщо games - це масив:
// export const selectGame = currentGameId => state =>
//   state.gameSlice.games.find(g => g._id === currentGameId);

//# якщо games - це об'єкт:
export const selectStorytellerId = currentGameId => state =>
  state.gameSlice.games[currentGameId].storytellerId;
//# якщо games - це масив:
// export const selectStorytellerId = currentGameId => {
//   const game = selectGame(currentGameId);
//   return game.selectStorytellerId;
// };

export const selectGameStatus = currentGameId => state =>
  state.gameSlice.games[currentGameId].gameStatus;
