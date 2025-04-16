import { Notify } from "notiflix";
import {
  setActiveScreen,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
  setZoomCardId,
} from "redux/game/localPersonalSlice.js";
import { gameApi } from "redux/game/gameApi.js";
import { clearActiveAction, updateGame } from "redux/game/gameSlice.js";

export const gameRun = (game, message, dispatch, activeActions, playerId) => {
  console.log("gameRun");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  const relatedAction = Object.values(activeActions).find(
    action => action.payload.updatedGame._id === game._id,
  );

  // Перевірка оптимістичного оновлення (якщо є relatedAction, то це ініціатор)
  if (relatedAction) {
    // Логіка для ініціатора оптимістичного оновлення:
    const { eventName } = relatedAction.payload;
    const key = `${eventName}-${game._id}`;

    if (!message) {
      // Спочатку оптимістичне оновлення стану Redux:
      dispatch(
        gameApi.util.updateQueryData("getCurrentGame", game._id, draft => {
          Object.assign(draft, game);
        }),
      );

      // Якщо отримана відповідь з сервера, або вона отримана з запізненням (більш ніж 10сек) то оновлюю стан на той, що прийшов від сервера
      dispatch(updateGame(game));
    } else {
      // Якщо є message, то значить це помилка з сервера. Треба зупинити таймер і відновити стан до попереднього:
      Notify.failure(message);
      dispatch(updateGame(relatedAction.meta?.previousGameState));

      // І скидаю таймер, якщо він ще не вийшов:
      if (relatedAction.meta?.timer) clearTimeout(relatedAction.meta.timer); // очищаю таймер
      dispatch(clearActiveAction(key));
    }
  } else {
    // Логіка для інших гравців
    if (message) Notify.failure(message);

    // Тут просто запит на синхронізацію з сервером для оновлення локального стану:
    // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));

    dispatch(
      gameApi.util.updateQueryData("getCurrentGame", game._id, draft => {
        Object.assign(draft, game);
      }),
    );
    dispatch(updateGame(game));
  }

  // Логіка для усіх
  // закриваю режими каруселі і zoom, якщо вони були відкриті
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

  // Перемикаю на потрібний екран:
  dispatch(
    setActiveScreen({
      gameId: game._id,
      playerId,
      screen: 0, // перемикаю на потрібний екран
    }),
  );
};
