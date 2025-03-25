import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction } from "redux/game/gameSlice.js";
import { clearState } from "redux/game/localPersonalSlice.js";

export const gameDelete = (
  gameId,
  message,
  dispatch,
  currentGameId,
  playerId,
  navigate,
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

  dispatch(clearActiveAction({}));
  dispatch(clearState());

  if (currentGameId === gameId) {
    navigate(`/game`, { replace: true });
  }
};
