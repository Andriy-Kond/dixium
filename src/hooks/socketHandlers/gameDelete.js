import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction } from "redux/game/gameSlice.js";
import {
  clearLocalState,
  removeToastIdRef,
} from "redux/game/localPersonalSlice.js";
import { selectToastIdRef } from "redux/selectors.js";

export const gameDelete = (
  gameId,
  message,
  dispatch,
  currentGameId,
  playerId,
  navigate,
  toastIdRef,
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
  dispatch(
    gameApi.util.updateQueryData("getAllGames", undefined, draft => {
      delete draft[gameId]; // Видаляємо гру за її _id
    }),
  );

  toast.dismiss(toastIdRef); // Закриє відповідне повідомлення
  dispatch(removeToastIdRef({ gameId, playerId }));
  dispatch(clearActiveAction({}));
  dispatch(clearLocalState());

  if (currentGameId === gameId) {
    navigate(`/game`, { replace: true });
  }
};
