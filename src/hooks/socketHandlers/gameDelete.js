import { toast } from "react-toastify";
import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction, deleteGame } from "redux/game/gameSlice.js";
import {
  clearLocalState,
  removeToastIdRef,
} from "redux/game/localPersonalSlice.js";

export const gameDelete = (
  gameId,
  message,
  dispatch,
  currentGameId,
  playerId,
  navigate,
  toastId,
) => {
  if (!gameId) {
    throw new Error(`The gameId is ${gameId}`);
  }

  //# якщо games (draft === gameSlice.games) - це масив
  // dispatch(
  //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
  //     return draft.filter(g => g._id !== game._id);
  //   }),
  // );

  // # якщо games (draft === gameSlice.games) - це об'єкт
  // dispatch(
  //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
  //     delete draft[gameId]; // Видаляємо гру за її _id
  //   }),
  // );

  // Інвалідація кешу для поточної гри
  // invalidateTags змусить RTK Query або очистити кеш, або повторно запитати дані, якщо потрібно.
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: gameId }]));
  // // Якщо список ігор відображається (наприклад, через getAllGames), додайте інвалідизацию тегу "LIST":
  // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: gameId }, { type: "Game", id: "LIST" }]));
  // // Для миттєвого оновлення UI (якщо GameInitialPage відображає список ігор) можна додати updateQueryData для getAllGames (якщо цей запит існує):
  // dispatch(
  //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
  //     delete draft[gameId];
  //   }),
  // );

  toast.dismiss(toastId); // Закриє відповідне повідомлення
  dispatch(removeToastIdRef({ gameId, playerId }));
  dispatch(clearActiveAction({}));
  dispatch(clearLocalState());
  dispatch(deleteGame());

  if (currentGameId === gameId) {
    navigate(`/game`, { replace: true });
  }
};
