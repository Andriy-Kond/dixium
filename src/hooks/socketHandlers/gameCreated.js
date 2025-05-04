import { setIsCreatingGame } from "redux/game/gameSlice.js";
import {
  setLocalGame,
  setUserActiveGameId,
} from "redux/game/localPersonalSlice.js";

export const gameCreated = (game, dispatch, navigate) => {
  console.log("gameCreated");

  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(setLocalGame(game));
  dispatch(setIsCreatingGame(true)); // todo скинути після початку гри.
  dispatch(setUserActiveGameId(game._id));
  navigate(`game/${game._id}`);
};
