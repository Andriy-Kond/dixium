import { toast } from "react-toastify";
import { gameApi } from "redux/game/gameApi.js";
import {
  clearActiveAction,
  clearGameInitialState,
  setIsCreatingGame,
} from "redux/game/gameSlice.js";
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
  const { _id: deletingGameId } = game;

  if (!deletingGameId)
    throw new Error(`The deletingGameId is ${deletingGameId}`);

  if (currentGameId === deletingGameId) {
    console.log("navigate");
    navigate(`/game`, { replace: true });
  }

  // Інвалідувати кеш для видаленої гри
  // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: deletingGameId }]));
  dispatch(gameApi.util.resetApiState());

  toast.dismiss(toastId); // Закриє відповідне повідомлення
  dispatch(removeToastIdRef({ gameId: deletingGameId, playerId }));
  // dispatch(clearActiveAction({}));
  // dispatch(setIsCreatingGame(false));
  dispatch(clearGameInitialState());
  dispatch(clearLocalState(game._id));
};

// запуск getUserByToken:
// dispatch(authApi.util.invalidateTags(["User"]));
