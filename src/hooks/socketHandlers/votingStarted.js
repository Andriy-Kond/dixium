import { updateGame } from "redux/game/gameSlice.js";

export const votingStarted = (game, dispatch) => {
  console.log("votingStarted");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateGame(game));
};
