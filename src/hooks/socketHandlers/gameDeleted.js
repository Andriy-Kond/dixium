import { toast } from "react-toastify";
// import { gameApi } from "redux/game/gameApi.js";
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
  if (!gameId) throw new Error(`The gameId is ${gameId}`);

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

  toast.dismiss(toastId); // Закриє відповідне повідомлення
  dispatch(removeToastIdRef({ gameId, playerId }));
  dispatch(clearActiveAction({}));
  dispatch(clearLocalState(game._id));

  if (currentGameId === gameId) {
    navigate(`/game`, { replace: true });
  }
};
