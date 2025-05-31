import { t } from "i18next";
import { Notify } from "notiflix";
import { gameApi } from "redux/game/gameApi.js";
import {
  clearLocalGames,
  setLocalGame,
  showNotification,
} from "redux/game/localPersonalSlice.js";

export const gameFound = (game, dispatch) => {
  // console.log("gameFound");
  // if (!game) throw new Error(`The game is ${game}`);

  if (game === null || !game || !game._id) {
    dispatch(clearLocalGames());
    dispatch(gameApi.util.invalidateTags(["Game"]));

    dispatch(
      showNotification({
        message: t("check_id"),
        type: "error",
      }),
    );
  } else {
    dispatch(setLocalGame(game));
    dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
    // dispatch(setFoundGameId(game._id));
    Notify.success(t("found_game_success", { gameNumber: game.playerGameId }));
  }
};
