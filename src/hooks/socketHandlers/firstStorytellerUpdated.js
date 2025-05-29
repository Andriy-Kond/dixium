import { gameApi } from "redux/game/gameApi.js";
import {
  setActiveScreen,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
  setIsShowMask,
  updateLocalGame,
} from "redux/game/localPersonalSlice.js";

export const firstStorytellerUpdated = (game, dispatch, playerId) => {
  if (!game) throw new Error(`The game is ${game}`);

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

  dispatch(
    setIsShowMask({
      gameId: game._id,
      playerId,
      isShow: true,
    }),
  );

  dispatch(updateLocalGame(game));
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
};
