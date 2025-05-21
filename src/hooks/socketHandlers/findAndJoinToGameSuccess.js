import { t } from "i18next";

import {
  clearLocalGames,
  setLocalGame,
  setUserActiveGameId,
  showNotification,
} from "redux/game/localPersonalSlice.js";

export const findAndJoinToGameSuccess = (game, message, dispatch, navigate) => {
  console.log("findAndJoinToGameSuccess");

  if (message && message.includes("This game already started")) {
    dispatch(
      showNotification({
        message: t("game_already_started"),
        type: "error",
      }),
    );
    return;
  }

  if (game === null) {
    dispatch(clearLocalGames());
    dispatch(
      showNotification({
        message: t("check_id"),
        type: "error",
      }),
    );
    return;
  }

  // navigate(`game/${game._id}/current-game`);
  navigate(`game/${game._id}/setup/sort-players`, { replace: true });
  dispatch(setLocalGame(game));
  dispatch(setUserActiveGameId(game._id));
};
