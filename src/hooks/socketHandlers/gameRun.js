import { Notify } from "notiflix";
import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction, updateGame } from "redux/game/gameSlice.js";

export const gameRun = (game, message, dispatch, activeActions) => {
  console.log("gameRun");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  const relatedAction = Object.values(activeActions).find(
    action => action.payload.updatedGame._id === game._id,
  );

  if (relatedAction) {
    // Логіка для ініціатора
    const { eventName } = relatedAction.payload;
    const key = `${eventName}-${game._id}`;

    // If there is a message, then it is an error, rollback of the state
    if (message) {
      dispatch(updateGame(relatedAction.meta.previousGameState));
      Notify.failure(message);
    }
    // Server response or response late (more then 10 sec) -> state update
    else dispatch(updateGame(game));

    if (relatedAction?.meta?.timer) {
      clearTimeout(relatedAction.meta.timer);
      dispatch(clearActiveAction(key));
    }
  } else {
    // Логіка для інших гравців
    if (message) Notify.failure(message);
    else
      dispatch(
        gameApi.util.updateQueryData("getAllGames", undefined, draft => {
          if (game._id in draft) {
            // Якщо гра вже є, оновлюємо її
            dispatch(updateGame(game)); // оновлення gameSlice (для актуального локального стейту)
            draft[game._id] = game; // оновлення кешу gameApi (для рендерингу переліку ігор)
          }
        }),
      );
  }
};
