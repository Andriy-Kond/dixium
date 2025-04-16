//* localPersonalSlice selectors:
import { LIGHT } from "utils/generals/constants.js";

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

// selector without using memoization (new obj must be always the same)
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
