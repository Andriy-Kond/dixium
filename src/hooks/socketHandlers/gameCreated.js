import { setLocalGame } from "redux/game/localPersonalSlice.js";

export const gameCreated = (game, dispatch) => {
  console.log("gameCreated");

  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(setLocalGame(game));
};
