import { updateGame } from "redux/game/gameSlice.js";
import {
  setActiveScreen,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
  setZoomCardId,
} from "redux/game/localPersonalSlice.js";

export const roundFinishSuccess = (
  game,
  message,
  dispatch,
  activeActions,
  playerId,
) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateGame(game));

  dispatch(
    setActiveScreen({
      gameId: game._id,
      playerId,
      screen: 2,
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
};
