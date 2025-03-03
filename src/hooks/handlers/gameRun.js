import { Notify } from "notiflix";
import { clearActiveAction, updateGame } from "redux/game/gameSlice.js";

export const gameRun = (game, message, dispatch, activeActions) => {
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
    } else {
      // Server response or response late (more then 10 sec) -> state update
      dispatch(updateGame(game));
    }

    if (relatedAction?.meta?.timer) {
      clearTimeout(relatedAction.meta.timer);
      dispatch(clearActiveAction(key));
    }
  } else {
    // Логіка для інших гравців
    if (message) {
      Notify.failure(message);
    } else {
      dispatch(updateGame(game));
    }
  }
};
