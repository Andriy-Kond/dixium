import { updateGame } from "redux/game/gameSlice.js";

export const nextStorytellerUpdated = (game, dispatch, playerId) => {
  console.log("nextStorytellerUpdated");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateGame(game));
};
