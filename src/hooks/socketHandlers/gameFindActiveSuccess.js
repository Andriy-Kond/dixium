import { t } from "i18next";
import { Notify } from "notiflix";

import { updateActiveGame } from "redux/game/gameSlice.js";

export const gameFindActiveSuccess = (game, message, dispatch) => {
  console.log("gameEnd");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateActiveGame(game));
  Notify.success(t("found_game_success", { gameNumber: game.playerGameId }));
};
