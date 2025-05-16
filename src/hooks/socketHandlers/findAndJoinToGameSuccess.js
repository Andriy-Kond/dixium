import { t } from "i18next";
import { Notify } from "notiflix";
import {
  clearLocalGames,
  setLocalGame,
  setUserActiveGameId,
  showNotification,
  updateIsRedirecting,
} from "redux/game/localPersonalSlice.js";

export const findAndJoinToGameSuccess = (game, dispatch, navigate) => {
  console.log("findAndJoinToGameSuccess");

  if (game === null) {
    dispatch(clearLocalGames());
    dispatch(
      showNotification({
        message: t("check_id"),
        type: "error",
      }),
    );
  } else {
    // navigate(`game/${game._id}/current-game`);
    navigate(`game/${game._id}/setup/sort-players`);
    dispatch(setLocalGame(game));
    dispatch(setUserActiveGameId(game._id));
    // dispatch(updateIsRedirecting(true));

    // setTimeout(() => {
    //   console.log("dispatch to 5 sec");
    // }, 5000);
    // Notify.success(t("found_game_success", { gameNumber: game.playerGameId }));
  }
};
