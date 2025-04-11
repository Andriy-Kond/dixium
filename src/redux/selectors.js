import { LIGHT } from "utils/generals/constants.js";

//* authSlice:
export const selectUserIsLoggedIn = state => state.authSlice.isLoggedIn;
export const selectUserToken = state => state.authSlice.userToken;
export const selectUserCredentials = state => state.authSlice.user;

//* localPersonalSlice selectors:
export const selectActiveScreen = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const screen = state.localPersonalSlice.screens[key];

  return screen ?? 0;
};

export const selectIsShowMask = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const isShowMask = state.localPersonalSlice.isShowMask[key];

  return isShowMask;
};

// selector without using memoization (new obj must be alway the same)
const defaultVotes = { firstVotedCardId: null, secondVotedCardId: null };
export const selectVotesLocal = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const votes = state.localPersonalSlice.votes[key];
  return votes !== undefined ? votes : defaultVotes;
};

export const selectSelectedCardId = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const selectedCardId = state.localPersonalSlice.selectedCardId[key];
  return selectedCardId || null;
};

export const selectIsCarouselModeHandScreen = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const isCarouselModeHandScreen =
    state.localPersonalSlice.isCarouselModeHandScreen[key];
  return isCarouselModeHandScreen || null;
};

export const selectIsCarouselModeTableScreen = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const isCarouselModeTableScreen =
    state.localPersonalSlice.isCarouselModeTableScreen[key];
  return isCarouselModeTableScreen || null;
};

export const selectZoomCardId = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const zoomCardId = state.localPersonalSlice.zoomCardId[key];
  return zoomCardId || null;
};

export const selectToastId = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const toastId = state.localPersonalSlice.toastId[key];
  return toastId || null;
};

const emptyCardsSet = { firstGuessCardSet: null, secondGuessCardSet: null };
export const selectCardsSet = (gameId, playerId) => state => {
  const key = `${gameId}_${playerId}`;
  const cardsSet = state.localPersonalSlice.cardsSet[key];
  return cardsSet || emptyCardsSet;
};

export const selectLang = state => state.localPersonalSlice.lang || "en";
export const selectTheme = state => state.localPersonalSlice.theme || LIGHT;

export const selectPageHeaderText = state =>
  state.localPersonalSlice.pageHeaderText;
export const selectPageHeaderBgColor = state =>
  state.localPersonalSlice.pageHeaderBgColor;
export const selectPageHeaderTextColor = state =>
  state.localPersonalSlice.pageHeaderTextColor;

export const selectPreloadImg = state => state.localPersonalSlice.preloadImg;

//* gameSlice:
export const selectIsCreatingGame = state => state.gameSlice.isCreatingGame;
export const selectCurrentDeckId = state => state.gameSlice.currentDeckId;
export const selectActiveActions = state => state.gameSlice.activeActions;

export const selectAllGames = state => state.gameSlice.games;

//# якщо games - це об'єкт:
export const selectGame = gameId => state => state.gameSlice.games[gameId];
//# якщо games - це масив:
// export const selectGame = gameId => state =>
//   state.gameSlice.games.find(g => g._id === gameId);

//# якщо games - це об'єкт:
export const selectStorytellerId = gameId => state =>
  state.gameSlice.games[gameId].storytellerId;
//# якщо games - це масив:
// export const selectStorytellerId = gameId => {
//   const game = selectGame(gameId);
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

export const selectIsGameRunning = gameId => state =>
  state.gameSlice.games[gameId].isGameRunning;

export const selectIsSingleCardMode = gameId => state =>
  state.gameSlice.games[gameId].isSingleCardMode;

export const selectIsPlayerGuessed = (gameId, playerId) => state => {
  const game = state.gameSlice.games[gameId];
  const player = game.players.find(p => p._id === playerId);
  return player.isGuessed;
};

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

export const selectRoundResults = gameId => state =>
  state.gameSlice.games[gameId].roundResults;
