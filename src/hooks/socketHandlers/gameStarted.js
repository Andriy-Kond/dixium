import { setLocalGame } from "redux/game/localPersonalSlice.js";

export const gameStarted = (game, games, dispatch) => {
  // console.log("gameStarted");
  const gameInState = Object.keys(games).find(key => key === game._id);

  if (gameInState) dispatch(setLocalGame(game));
};
