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

export const selectGameStatus = gameId => state =>
  state.gameSlice.games[gameId].gameStatus;

export const selectGamePlayers = gameId => state =>
  state.gameSlice.games[gameId].players;

export const selectCardsOnTable = gameId => state =>
  state.gameSlice.games[gameId].cardsOnTable;

export const selectPlayerHand = (gameId, playerId) => state => {
  const game = state.gameSlice.games[gameId];
  const player = game.players.find(p => p._id === playerId);
  return player.hand;
};

export const selectGameDeck = gameId => state =>
  state.gameSlice.games[gameId].deck;

export const selectGameDiscardPile = gameId => state =>
  state.gameSlice.games[gameId].discardPile;

export const selectIsFirstTurn = gameId => state =>
  state.gameSlice.games[gameId].isFirstTurn;

export const selectIsGameRunning = gameId => state =>
  state.gameSlice.games[gameId].isGameRunning;

export const selectIsSingleCardMode = gameId => state =>
  state.gameSlice.games[gameId].isSingleCardMode;

export const selectIsPlayerVoted = (gameId, playerId) => state => {
  const game = state.gameSlice.games[gameId];
  const player = game.players.find(p => p._id === playerId);
  return player.isVoted;
};

export const selectHostPlayerId = gameId => state =>
  state.gameSlice.games[gameId].hostPlayerId;

export const selectVotes = gameId => state =>
  state.gameSlice.games[gameId].votes;

export const selectScores = gameId => state =>
  state.gameSlice.games[gameId].scores;
