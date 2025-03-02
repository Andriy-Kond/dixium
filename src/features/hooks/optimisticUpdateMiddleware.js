// optimisticUpdateMiddleware.js
import { Notify } from "notiflix";
import socket from "socket.js";

const optimisticUpdateMiddleware =
  ({ dispatch, getState }) =>
  next =>
  action => {
    if (action.type !== "game/performOptimisticUpdate") {
      return next(action);
    }

    const { eventName, updatedGame, timeout = 2000 } = action.payload;
    const currentGame = getState().game[currentGameId]; // Припускаємо, що у вас є селектор для поточної гри

    // Оптимістичне оновлення
    dispatch({ type: "game/updateGame", payload: updatedGame });

    // Відправка на сервер
    socket.emit(eventName, updatedGame);

    // Таймер для відкатування
    const timer = setTimeout(() => {
      Notify.failure(
        `No response from server for ${eventName}. Reverting state.`,
      );
      dispatch({ type: "game/updateGame", payload: currentGame });
    }, timeout);

    // Зберігання таймера в action.meta для слухачів сокетів
    action.meta = { timer };

    return next(action);
  };

export default optimisticUpdateMiddleware;
