import { Notify } from "notiflix";
import { clearActiveAction } from "redux/game/gameSlice.js";
import { updateLocalGame } from "redux/game/localPersonalSlice.js";

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
      dispatch(updateLocalGame(relatedAction.meta.previousGameState));
      Notify.failure(message);
    } else dispatch(updateLocalGame(game));

    if (relatedAction?.meta?.timer) {
      clearTimeout(relatedAction.meta.timer);
      dispatch(clearActiveAction(key));
    }
  } else {
    // Логіка для інших гравців
    if (message) Notify.failure(message);
    else dispatch(updateLocalGame(game));
  }
};
