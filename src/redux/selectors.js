import { LIGHT } from "utils/generals/constants.js";

//* authSlice:
export const selectUserIsLoggedIn = state => state.authSlice.isLoggedIn;
export const selectUserToken = state => state.authSlice.user.token;
export const selectUserCredentials = state => state.authSlice.user;

//* gameSlice:
export const selectIsCreatingGame = state => state.gameSlice.isCreatingGame;
export const selectCurrentDeckId = state => state.gameSlice.currentDeckId;
export const selectActiveActions = state => state.gameSlice.activeActions;
export const selectActiveActionsTest = state =>
  state.gameSlice.activeActionsTest;

export const selectSelectedDeckIds = state => state.gameSlice.selectedDeckIds;
export const selectUserSelectedDeckIds = state =>
  state.gameSlice.userSelectedDeckIds;
export const selectCycleState = state => state.gameSlice.cycleState;
export const selectInternetStatus = state => state.gameSlice.internetStatus;

//* localPersonalSlice selectors:
export const selectIsRedirecting = state =>
  state.localPersonalSlice.isRedirecting;
export const selectIsSetPassword = state =>
  state.localPersonalSlice.isSetPassword;
export const selectLocalGames = state => state.localPersonalSlice.games;
export const selectLocalGame = gameId => state => {
  return state.localPersonalSlice.games[gameId];
};

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
export const selectTheme = state => state.localPersonalSlice.theme || "LIGHT";
export const selectVisualTheme = state =>
  state.localPersonalSlice.visualTheme || "LIGHT";

export const selectPageHeaderText = state =>
  state.localPersonalSlice.pageHeaderText;
export const selectPageHeaderBgColor = state =>
  state.localPersonalSlice.pageHeaderBgColor;
export const selectPageHeaderTextColor = state =>
  state.localPersonalSlice.pageHeaderTextColor;

export const selectPreloadImg = state => state.localPersonalSlice.preloadImg;
export const selectUserActiveGameId = state =>
  state.localPersonalSlice.userActiveGameId;

export const selectAllGames = state => state.localPersonalSlice.games;

//# якщо games - це об'єкт:
export const selectGame = gameId => state =>
  state.localPersonalSlice.games[gameId];
//# якщо games - це масив:
// export const selectGame = gameId => state =>
//   state.localPersonalSlice.games.find(g => g._id === gameId);

//# якщо games - це об'єкт:
export const selectStorytellerId = gameId => state =>
  state.localPersonalSlice.games[gameId].storytellerId;
//# якщо games - це масив:
// export const selectStorytellerId = gameId => {
//   const game = selectGame(gameId);
//   return game.selectStorytellerId;
// };

export const selectGameStatus = gameId => state =>
  state.localPersonalSlice.games[gameId].gameStatus;

export const selectCardsOnTable = gameId => state =>
  state.localPersonalSlice.games[gameId].cardsOnTable;

//! kill
export const selectPlayerHand = (gameId, playerId) => state => {
  const game = state.localPersonalSlice.games[gameId];
  const player = game.players.find(p => p._id === playerId);
  return player.hand;
};

export const selectGameDiscardPile = gameId => state =>
  state.localPersonalSlice.games[gameId].discardPile;

export const selectIsGameRunning = gameId => state =>
  state.localPersonalSlice.games[gameId]?.isGameRunning;

export const selectIsGameStarted = gameId => state =>
  state.localPersonalSlice.games[gameId]?.isGameStarted;

export const selectIsSingleCardMode = gameId => state =>
  state.localPersonalSlice.games[gameId].isSingleCardMode;

//! kill
export const selectIsPlayerGuessed = (gameId, playerId) => state => {
  const game = state.localPersonalSlice.games[gameId];
  const player = game.players.find(p => p._id === playerId);
  return player.isGuessed;
};

//! kill
export const selectIsPlayerVoted = (gameId, playerId) => state => {
  const game = state.localPersonalSlice.games[gameId];
  const player = game.players.find(p => p._id === playerId);
  return player.isVoted;
};

export const selectHostPlayerId = gameId => state =>
  state.localPersonalSlice.games[gameId].hostPlayerId;

export const selectVotes = gameId => state =>
  state.localPersonalSlice.games[gameId].votes;

export const selectScores = gameId => state =>
  state.localPersonalSlice.games[gameId].scores;

export const selectRoundResults = gameId => state =>
  state.localPersonalSlice.games[gameId].roundResults;

export const selectNotification = state =>
  state.localPersonalSlice.notification;
