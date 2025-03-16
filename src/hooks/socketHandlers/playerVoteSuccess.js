import { updateGame } from "redux/game/gameSlice.js";

export const playerVoteSuccess = (game, dispatch) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateGame(game));
};
