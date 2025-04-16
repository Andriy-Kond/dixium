import { t } from "i18next";
import { Notify } from "notiflix";

import { deleteGame, updateGame } from "redux/game/gameSlice.js";

export const gameFindActiveSuccess = (game, message, gameNumber, dispatch) => {
  console.log("gameFindActiveSuccess");
  // if (!game) {
  //   throw new Error(`The game is ${game}`);
  // }
  if (message) {
    Notify.failure(t("game_with_number_not_found", { gameNumber }));
    dispatch(deleteGame());
  } else {
    dispatch(updateGame(game));
    Notify.success(t("found_game_success", { gameNumber: game.playerGameId }));
  }
};
