export const selectUserIsLoggedIn = state => state.authSlice.isLoggedIn;
export const selectUserToken = state => state.authSlice.userToken;
export const selectUserCredentials = state => state.authSlice.user;

export const selectIsCreatingGame = state => state.gameSlice.isCreatingGame;

export const selectGameDeckId = state => state.gameSlice.gameDeckId;

// export const selectGameId = state => state.gameSlice.gameId;
// export const selectedDeck = state => state.gameSlice.deck;
export const selectPlayers = state => state.gameSlice.players;
