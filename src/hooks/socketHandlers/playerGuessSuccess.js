import { updateGame } from "redux/game/gameSlice.js";

export const playerGuessSuccess = (game, dispatch) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateGame(game));
};
