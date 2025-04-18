import { t } from "i18next";
import { Notify } from "notiflix";

export const playerJoined = (
  gameId,
  player,
  message,
  userCredentials,
  currentGameId,
  navigate,
) => {
  // console.log("playerJoined");
  if (!gameId) {
    throw new Error(`The game is ${gameId}`);
  }

  // message && Notify.success(message); // Notify about new player
  message &&
    Notify.success(
      t("player_joined", { playerName: player.name.toUpperCase() }),
    ); // Notify about new player

  if (player._id === userCredentials._id && currentGameId !== gameId)
    navigate(`/game/${gameId}`);
};
