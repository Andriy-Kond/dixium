import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction, deleteActiveGame } from "redux/game/gameSlice.js";
import {
  clearLocalState,
  removeToastIdRef,
} from "redux/game/localPersonalSlice.js";
import { selectToastId } from "redux/selectors.js";

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

  //# якщо games (draft === gameSlice.games) - це об'єкт
  // dispatch(
  //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
  //     delete draft[gameId]; // Видаляємо гру за її _id
  //   }),
  // );

  // !не правильно
  // dispatch(
  //   gameApi.util.updateQueryData("getCurrentGame", undefined, draft => {
  //     draft.activeGame = null; // Видаляємо гру за її _id
  //   }),
  // );

  // Інвалідація кешу для поточної гри
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: gameId }]));
  // invalidateTags змусить RTK Query або очистити кеш, або повторно запитати дані, якщо потрібно.

  toast.dismiss(toastId); // Закриє відповідне повідомлення
  dispatch(removeToastIdRef({ gameId, playerId }));
  dispatch(clearActiveAction({}));
  dispatch(clearLocalState());
  dispatch(deleteActiveGame());

  if (currentGameId === gameId) {
    navigate(`/game`, { replace: true });
  }
};
