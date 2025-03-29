import { setActiveAction, updateGame } from "redux/game/gameSlice.js";
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
      const previousGameState = getState().gameSlice.games[updatedGame._id];

      // Оптимістичне оновлення
      dispatch(updateGame(updatedGame));

      // Відправка на сервер
      socket.emit(eventName, { updatedGame });

      // Таймер для відкатування
      const timer = setTimeout(() => {
        Notify.failure(t("err_no_response_server"), { eventName });
        dispatch(updateGame(previousGameState));
        // dispatch(clearActiveAction(key));
      }, timeout);

      // записую стан activeActions даними із meta:
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
