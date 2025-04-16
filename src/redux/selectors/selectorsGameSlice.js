//* gameSlice:
export const selectIsCreatingGame = state => state.gameSlice.isCreatingGame;
export const selectCurrentDeckId = state => state.gameSlice.currentDeckId;
export const selectActiveActions = state => state.gameSlice.activeActions;
export const selectGame = state => state.gameSlice.activeGame;
export const selectAllGames = state => state.gameSlice.games;

export const selectStorytellerId = state =>
  state.gameSlice.activeGame.storytellerId;

export const selectGameStatus = state => state.gameSlice.activeGame.gameStatus;

export const selectGamePlayers = state => state.gameSlice.activeGame.players;

export const selectCardsOnTable = state =>
  state.gameSlice.activeGame.cardsOnTable;

export const selectPlayerHand = playerId => state => {
  const game = state.gameSlice.activeGame;
  const player = game.players.find(p => p._id === playerId);
  return player ? player.hand : null;
};
export const selectIsPlayerGuessed = playerId => state => {
  const game = state.gameSlice.activeGame;
  const player = game.players.find(p => p._id === playerId);
  return player ? player.isGuessed : null;
};
export const selectIsPlayerVoted = playerId => state => {
  const game = state.gameSlice.activeGame;
  const player = game.players.find(p => p._id === playerId);
  return player ? player.isVoted : null;
};

export const selectGameDeck = state => state.gameSlice.activeGame.deck;

export const selectGameDiscardPile = state =>
  state.gameSlice.activeGame.discardPile;

export const selectIsGameRunning = state =>
  state.gameSlice.activeGame.isGameRunning;

export const selectIsSingleCardMode = state =>
  state.gameSlice.activeGame.isSingleCardMode;

export const selectHostPlayerId = state =>
  state.gameSlice.activeGame.hostPlayerId;

export const selectVotes = state => state.gameSlice.activeGame.votes;

export const selectScores = state => state.gameSlice.activeGame.scores;

export const selectRoundResults = state =>
  state.gameSlice.activeGame.roundResults;
