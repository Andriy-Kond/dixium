import { Notify } from "notiflix";
import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction, updateGame } from "redux/game/gameSlice.js";

export const playersOrderUpdate = (game, message, dispatch, activeActions) => {
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
      dispatch(updateGame(relatedAction.meta.previousGameState));
      Notify.failure(message);

      // // Не обов'язково для цього додатку, але хай буде на випадок майбутніх змін
      // dispatch(
      //   gameApi.util.updateQueryData("getCurrentGame", game._id, draft => {
      //     Object.assign(draft, game);
      //   }),
      // );
      // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
    } else dispatch(updateGame(game));

    if (relatedAction?.meta?.timer) {
      clearTimeout(relatedAction.meta.timer);
      dispatch(clearActiveAction(key));
    }
  } else {
    // Логіка для інших гравців
    if (message) Notify.failure(message);
    else {
      dispatch(updateGame(game));

      // // Не обов'язково для цього додатку, але хай буде на випадок майбутніх змін
      // dispatch(
      //   gameApi.util.updateQueryData("getCurrentGame", game._id, draft => {
      //     Object.assign(draft, game);
      //   }),
      // );
      // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
    }
  }
};
