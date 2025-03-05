import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction, setCurrentGameId } from "redux/game/gameSlice.js";

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

  dispatch(
    gameApi.util.updateQueryData("getAllGames", undefined, draft => {
      return draft.filter(g => g._id !== game._id);
    }),
  );

  dispatch(setCurrentGameId(null));
  dispatch(clearActiveAction({}));

  if (currentGameId === game._id) {
    navigate(`/game`, { replace: true });
  }
};
