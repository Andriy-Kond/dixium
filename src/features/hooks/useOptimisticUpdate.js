// useOptimisticUpdate.js
import { useDispatch, useSelector } from "react-redux";
import { Notify } from "notiflix";
import socket from "socket.js";
import { clearRef, setRef, updateGame } from "features/game/gameSlice";
import { selectRefs } from "app/selectors";

const useOptimisticUpdate = () => {
  const dispatch = useDispatch();
  const refs = useSelector(selectRefs);

  const performOptimisticUpdate = ({
    eventName, // Назва події для socket.io (наприклад, "newPlayersOrder")
    updatedGame, // Оновлена гра
    prevStateKey, // Ключ для збереження попереднього стану (наприклад, PREV_DND_GAME_STATE)
    timerKey, // Ключ для таймера (наприклад, TIMER_DND)
    timeout = 2000, // Час очікування за замовчуванням (2 секунди)
    onSuccess, // Опціональний колбек для успішного оновлення
    onFailure, // Опціональний колбек для помилки
  }) => {
    // Збереження попереднього стану
    dispatch(
      setRef({
        key: prevStateKey,
        value: refs[prevStateKey] || updatedGame, // Попередній стан гри
      }),
    );

    // Оптимістичне оновлення локального стану
    dispatch(updateGame(updatedGame));

    // Відправка на сервер
    socket.emit(eventName, updatedGame);

    // Запуск таймера
    const timer = setTimeout(() => {
      if (refs[prevStateKey]) {
        Notify.failure(
          `No response from server for ${eventName}. Reverting state.`,
        );
        dispatch(updateGame(refs[prevStateKey]));
        dispatch(clearRef(prevStateKey));
        if (onFailure) onFailure();
      }
    }, timeout);

    dispatch(setRef({ key: timerKey, value: timer }));

    // Повернення функції для очищення таймера (використовується в слухачах сокетів)
    return () => {
      clearTimeout(refs[timerKey]);
      dispatch(clearRef(timerKey));
      dispatch(clearRef(prevStateKey));
      if (onSuccess) onSuccess();
    };
  };

  return { performOptimisticUpdate };
};

export default useOptimisticUpdate;
