import { t } from "i18next";
import { Notify } from "notiflix";

import { setActiveGame, setFoundGame } from "redux/game/gameSlice.js";

export const gameFindActiveSuccess = (game, message, dispatch) => {
  console.log("gameFindActiveSuccess");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  // dispatch(setActiveGame(game));
  dispatch(setFoundGame(game));
  Notify.success(t("found_game_success", { gameNumber: game.playerGameId }));
};
