import { updateLocalGame } from "redux/game/localPersonalSlice.js";

export const playerGuessSuccess = (game, dispatch) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateLocalGame(game));
};
