import { t } from "i18next";
import { Notify } from "notiflix";

import { setActiveGame, setFoundGame } from "redux/game/gameSlice.js";
import { setLocalFoundGame } from "redux/game/localPersonalSlice.js";

export const gameFindActiveSuccess = (game, message, gameNumber, dispatch) => {
  console.log("gameFindActiveSuccess");
  if (message) {
    throw new Error(`The game with number ${gameNumber} not found`);
  }

  // dispatch(setActiveGame(game));
  // dispatch(setFoundGame(game));
  dispatch(setLocalFoundGame(game));
  Notify.success(t("found_game_success", { gameNumber: game.playerGameId }));
};
