import { Notify } from "notiflix";
import {
  clearActiveAction,
  updateActiveGame,
  updateGame,
} from "redux/game/gameSlice.js";

export const playerVoteSuccess = (game, message, dispatch, activeActions) => {
  // console.log("playerVoteSuccess");
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

    if (message) {
      // dispatch(updateGame(relatedAction.meta.previousGameState));
      dispatch(updateActiveGame(relatedAction.meta.previousGameState));
      Notify.failure(message);
    } else {
      // dispatch(updateGame(game));
      dispatch(updateActiveGame(game));
    }

    if (relatedAction?.meta?.timer) {
      clearTimeout(relatedAction.meta.timer);
      dispatch(clearActiveAction(key));
    }
  } else {
    // Логіка для інших гравців
    if (message) Notify.failure(message);
    // else dispatch(updateGame(game));
    dispatch(updateActiveGame(game));
  }
};
