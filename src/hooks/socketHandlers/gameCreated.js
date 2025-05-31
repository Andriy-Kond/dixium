import { gameApi } from "redux/game/gameApi.js";
import {
  setLocalGame,
  setUserActiveGameId,
} from "redux/game/localPersonalSlice.js";

export const gameCreated = (game, dispatch, navigate) => {
  // console.log("game_Created");
  if (!game) throw new Error(`The game is ${game}`);

  dispatch(setLocalGame(game));
  dispatch(setUserActiveGameId(game._id));
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));

  navigate(`game/${game._id}/setup/prepare-game`);
};
