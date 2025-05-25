import { updateLocalGame } from "redux/game/localPersonalSlice.js";

export const nextStorytellerUpdated = (game, dispatch, playerId) => {
  // console.log("nextStorytellerUpdated");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateLocalGame(game));
};
