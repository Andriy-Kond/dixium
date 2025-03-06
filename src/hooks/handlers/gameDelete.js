import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction } from "redux/game/gameSlice.js";

// todo: optimistic update!
export const gameDelete = (
  game,
  message,
  dispatch,
  currentGameId,
  navigate,
) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
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
      delete draft[game._id]; // Видаляємо гру за її _id
    }),
  );

  dispatch(clearActiveAction({}));

  if (currentGameId === game._id) {
    navigate(`/game`, { replace: true });
  }
};
