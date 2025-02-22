export const selectUserIsLoggedIn = state => state.authSlice.isLoggedIn;
export const selectUserToken = state => state.authSlice.userToken;
export const selectUserCredentials = state => state.authSlice.user;

export const selectedDeck = state => state.gameSlice.deck;
export const selectPlayers = state => state.gameSlice.players;
export const selectIsCreatingGame = state => state.gameSlice.isCreatingGame;
export const selectCurrentDeckId = state => state.gameSlice.currentDeckId;
export const selectCurrentGameId = state => state.gameSlice.currentGameId;

export const selectGames = state => state.gameSlice.games;
