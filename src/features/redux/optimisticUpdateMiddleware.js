import { setActiveAction, updateGame } from "features/game/gameSlice.js";
import { Notify } from "notiflix";
import socket from "socket.js";

const optimisticUpdateMiddleware =
  ({ dispatch, getState }) =>
  next =>
  action => {
    if (action.type === "game/performOptimisticUpdate") {
      const { eventName, updatedGame, timeout = 2000 } = action.payload;

      // Зберігаємо попередній стан гри:
      const previousGameState = getState().gameSlice.games.find(
        g => g._id === updatedGame._id,
      );

      // Оптимістичне оновлення
      // dispatch({ type: "game/updateGame", payload: updatedGame }); // запускає редюсер updateGame у gameSlice
      dispatch(updateGame(updatedGame));

      // Відправка на сервер
      socket.emit(eventName, updatedGame);

      // Таймер для відкатування
      const timer = setTimeout(() => {
        Notify.failure(
          `No response from server for ${eventName}. Reverting state.`,
        );
        dispatch(updateGame(previousGameState));
      }, timeout);

      // Оновлюємо стан activeActions із meta
      const key = `${eventName}-${updatedGame._id}`;
      dispatch(
        setActiveAction({
          key,
          value: {
            ...action,
            meta: { timer, previousGameState, eventName },
          },
        }),
      );

      // Зберігання таймера в action.meta для слухачів сокетів
      // Додаємо мета-дані до action для подальшого використання
      // action.meta = { timer, previousGameState, eventName };
      // action.payload.meta = { timer, previousGameState, eventName };

      // Створюємо новий об'єкт action з meta
      // const enhancedAction = {
      //   ...action,
      //   meta: { timer, previousGameState },
      // };

      // return next(enhancedAction);
    }

    return next(action);
  };

export default optimisticUpdateMiddleware;
