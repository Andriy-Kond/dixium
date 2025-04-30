import { useEffect, useRef } from "react";
import css from "./InformMessage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { selectNotification } from "redux/selectors.js";
import { hideNotification } from "redux/game/localPersonalSlice.js";

export default function InformMessage() {
  const dispatch = useDispatch();
  const { message, duration, type } = useSelector(selectNotification);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!message) return; // Не створюємо таймер, якщо повідомлення відсутнє

    // Очищення попереднього таймеру
    if (timerRef.current) clearTimeout(timerRef.current);

    // Новий таймер
    timerRef.current = setTimeout(() => {
      dispatch(hideNotification());
      // typeof onClose === "function" гарантує, що onClose викликається лише якщо це функція.
      // if (onClose && typeof onClose === "function") onClose();
      timerRef.current = null; // Очищення після виконання
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dispatch, duration, message]);

  // Не рендеримо нічого, якщо повідомлення немає
  if (!message) return null;

  // return <p className={css.informMessage}>{message}</p>;
  return <p className={`${css.informMessage} ${css[type] || ""}`}>{message}</p>;
}
