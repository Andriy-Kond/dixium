import {
  setActiveScreen,
  setIsShowMask,
} from "redux/game/activeScreenSlice.js";
import { updateGame } from "redux/game/gameSlice.js";

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
    setIsShowMask({
      gameId: game._id,
      playerId,
      isShow: true,
    }),
  );

  dispatch(updateGame(game));
};
