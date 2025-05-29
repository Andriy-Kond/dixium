import { gameApi } from "redux/game/gameApi.js";
import { setLocalGame } from "redux/game/localPersonalSlice.js";

export const gameStarted = (game, games, dispatch) => {
  // console.log("gameStarted");
  const gameInState = Object.keys(games).find(key => key === game._id); // todo - чи потрібна ця перевірка?

  if (gameInState) {
    dispatch(setLocalGame(game));
    dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
  }
};
