import {
  setActiveScreen,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
  setIsShowMask,
  setZoomCardId,
  updateLocalGame,
} from "redux/game/localPersonalSlice.js";

export const firstStorytellerUpdated = (game, dispatch, playerId) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(
    setActiveScreen({
      gameId: game._id,
      playerId,
      screen: 0,
    }),
  );

  dispatch(
    setIsCarouselModeTableScreen({
      gameId: game._id,
      playerId,
      isCarouselModeTableScreen: false,
    }),
  );

  dispatch(
    setIsCarouselModeHandScreen({
      gameId: game._id,
      playerId,
      isCarouselModeHandScreen: false,
    }),
  );

  dispatch(setZoomCardId({ gameId: game._id, playerId, zoomCardId: null }));

  dispatch(
    setIsShowMask({
      gameId: game._id,
      playerId,
      isShow: true,
    }),
  );

  dispatch(updateLocalGame(game));
};
