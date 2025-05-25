import { t } from "i18next";
import { Notify } from "notiflix";
import { gameApi } from "redux/game/gameApi.js";
import { updatePlayers } from "redux/game/localPersonalSlice.js";

export const playerJoined = ({
  game,
  player,
  message,
  userId,
  currentGameId,
  navigate,
  dispatch,
}) => {
  // console.log("playerJoined");
  const { _id: gameId } = game;

  if (!gameId) throw new Error(`The gameId is ${gameId}`);

  // console.log("userId !== player._id:::", userId !== player._id);
  if (userId !== player._id) {
    dispatch(updatePlayers(game));
    // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]))  ;
  }

  // Notify about new player
  message &&
    Notify.success(
      t("player_joined", { playerName: player.name.toUpperCase() }),
    );

  // якщо цей гравець - це тільки-но доданий гравець і він НЕ на сторінці з цією поточною грою
  // if (player._id === userId && currentGameId !== gameId)
  //   navigate(`/game/${gameId}`);
};
