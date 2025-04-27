import { toast } from "react-toastify";

import { clearActiveAction } from "redux/game/gameSlice.js";
import {
  clearLocalState,
  removeToastIdRef,
} from "redux/game/localPersonalSlice.js";

export const gameDeleted = (
  game,
  dispatch,
  currentGameId,
  playerId,
  navigate,
  toastId,
) => {
  const { _id: gameId } = game;
  console.log("gameDeleted >> game:::", game);
  if (!gameId) throw new Error(`The gameId is ${gameId}`);

  toast.dismiss(toastId); // Закриє відповідне повідомлення
  dispatch(removeToastIdRef({ gameId, playerId }));
  dispatch(clearActiveAction({}));
  dispatch(clearLocalState(game._id));

  // запуск getUserByToken:
  // dispatch(authApi.util.invalidateTags(["User"]));

  if (currentGameId === gameId) {
    navigate(`/game`, { replace: true });
  }
};
