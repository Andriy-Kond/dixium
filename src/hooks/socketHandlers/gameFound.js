import { t } from "i18next";
import { Notify } from "notiflix";
import {
  clearLocalGames,
  setLocalGame,
} from "redux/game/localPersonalSlice.js";

export const gameFound = (game, dispatch) => {
  console.log("gameFound");
  // if (!game) throw new Error(`The game is ${game}`);

  if (game === null) dispatch(clearLocalGames());
  else {
    dispatch(setLocalGame(game));
    // dispatch(setFoundGameId(game._id));
    Notify.success(t("found_game_success", { gameNumber: game.playerGameId }));
  }
};
