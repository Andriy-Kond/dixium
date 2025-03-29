import {
  clearActiveAction,
  setActiveAction,
  updateGame,
} from "redux/game/gameSlice.js";
import { Notify } from "notiflix";
import socket from "services/socket.js";
import { t } from "i18next";

const optimisticUpdateMiddleware =
  ({ dispatch, getState }) =>
  next =>
  action => {
    if (action.type === "game/performOptimisticUpdate") {
      const { eventName, updatedGame, timeout } = action.payload;
      const key = `${eventName}-${updatedGame._id}`;

      // Зберігаємо попередній стан гри:
      //# якщо games - це об'єкт:
      const previousGameState = getState().gameSlice.games[updatedGame._id];

      //# якщо games - це масив
      // const previousGameState = getState().gameSlice.games.find(
      //   g => g._id === updatedGame._id,
      // );

      // Оптимістичне оновлення
      // dispatch({ type: "game/updateGame", payload: updatedGame }); // запускає редюсер updateGame у gameSlice
      // або ж при використанні Redux можна так:
      dispatch(updateGame(updatedGame));

      // Відправка на сервер
      socket.emit(eventName, { updatedGame });

      // Таймер для відкатування
      const timer = setTimeout(() => {
        Notify.failure(t("err_no_response_server"), { eventName });
        dispatch(updateGame(previousGameState));
        dispatch(clearActiveAction(key));
      }, timeout);

      // Зберігання таймера в action.meta для слухачів сокетів
      // Додаємо мета-дані до action для подальшого використання
      // action.meta = { timer, previousGameState, eventName };
      // action.payload.meta = { timer, previousGameState, eventName };

      // Або створюємо новий об'єкт action з meta
      // const enhancedAction = {
      //   ...action,
      //   meta: { timer, previousGameState },
      // };
      // return next(enhancedAction);
      //! Не працює, бо action:
      //! console.log("Is action extensible?", Object.isExtensible(action)); // false - не розширюваний
      //! console.log("Is action sealed?", Object.isSealed(action)); // true - запечатаний
      //! console.log("Is action frozen?", Object.isFrozen(action)); // true - є замороженим (frozen), тобто він не дозволяє ні додавання нових властивостей, ні зміни існуючих. Redux Toolkit заморожує об'єкти дій за допомогою Object.freeze() для забезпечення імутабельності та виявлення випадкових мутацій.
      // Тому записую стан activeActions даними із meta:
      dispatch(
        setActiveAction({
          key,
          value: {
            ...action,
            meta: { timer, previousGameState, eventName },
          },
        }),
      );
    }

    return next(action);
  };

export default optimisticUpdateMiddleware;
