import { useEffect, useRef } from "react";
import css from "./InfoMessage.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { selectNotification } from "redux/selectors.js";
import { hideNotification } from "redux/game/localPersonalSlice.js";

export default function InfoMessage() {
  const dispatch = useDispatch();
  const {
    message = "",
    duration = 1000,
    type = "info",
  } = useSelector(selectNotification);
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

  const handleClose = () => {
    console.log("handleClose");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      dispatch(hideNotification());
      timerRef.current = null;
    }
  };

  // якщо повідомлення немає
  if (!message) return null;

  // return <p className={css.infoMessage}>{message}</p>;
  return (
    <button
      className={`${css.infoMessage} ${css[type] || ""}`}
      onClick={handleClose}>
      {message}
    </button>
  );
}
