import { updateGame } from "redux/game/gameSlice.js";

export const roundFinishSuccess = (game, message, dispatch, activeActions) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateGame(game));
};
