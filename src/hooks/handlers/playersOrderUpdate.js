import { Notify } from "notiflix";
import { clearActiveAction, updateGame } from "redux/game/gameSlice.js";

export const playersOrderUpdate = (
  game,
  errorMessage,
  dispatch,
  activeActions,
) => {
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
    if (errorMessage) {
      dispatch(updateGame(relatedAction.meta.previousGameState));
      Notify.failure(errorMessage);
    } else {
      dispatch(updateGame(game));
    }
    if (relatedAction?.meta?.timer) {
      clearTimeout(relatedAction.meta.timer);
      dispatch(clearActiveAction(key));
    }
  } else {
    // Логіка для інших гравців
    if (errorMessage) {
      Notify.failure(errorMessage);
    } else {
      dispatch(updateGame(game));
    }
  }
};
