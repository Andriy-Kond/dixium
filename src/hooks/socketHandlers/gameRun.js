import { Notify } from "notiflix";
import {
  setActiveScreen,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
  setZoomCardId,
  updateLocalGame,
} from "redux/game/localPersonalSlice.js";
import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction } from "redux/game/gameSlice.js";

export const gameRun = (game, message, dispatch, activeActions, playerId) => {
  // console.log("gameRun");
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
      dispatch(updateLocalGame(relatedAction.meta.previousGameState));
      Notify.failure(message);
    }
    // Server response or response late (more then 10 sec) -> state update
    else dispatch(updateLocalGame(game));

    dispatch(
      setActiveScreen({
        gameId: game._id,
        playerId,
        screen: 0,
      }),
    );

    dispatch(
      setIsCarouselModeTableScreen({
        gameId: game._id,
        playerId,
        isCarouselModeTableScreen: false,
      }),
    );

    dispatch(
      setIsCarouselModeHandScreen({
        gameId: game._id,
        playerId,
        isCarouselModeHandScreen: false,
      }),
    );

    dispatch(setZoomCardId({ gameId: game._id, playerId, zoomCardId: null }));

    if (relatedAction?.meta?.timer) {
      clearTimeout(relatedAction.meta.timer);
      dispatch(clearActiveAction(key));
    }
  } else {
    // Логіка для інших гравців
    if (message) Notify.failure(message);
    // else {
    // dispatch(
    //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
    //     if (game._id in draft) {
    //       // Якщо гра вже є, оновлюємо її
    //       dispatch(updateLocalGame(game)); // оновлення gameSlice (для актуального локального стейту)
    //       draft[game._id] = game; // оновлення кешу gameApi (для рендерингу переліку ігор)

    //       dispatch(
    //         setActiveScreen({
    //           gameId: game._id,
    //           playerId: playerId,
    //           screen: 0,
    //         }),
    //       );
    //     }
    //   }),
    // );
    // }
  }
};
