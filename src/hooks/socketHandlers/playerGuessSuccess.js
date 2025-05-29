import { gameApi } from "redux/game/gameApi.js";
import { updateLocalGame } from "redux/game/localPersonalSlice.js";

export const playerGuessSuccess = (game, dispatch) => {
  if (!game) throw new Error(`The game is ${game}`);

  dispatch(updateLocalGame(game));
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
};
