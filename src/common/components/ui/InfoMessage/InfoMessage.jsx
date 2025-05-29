import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectNotification } from "redux/selectors.js";
import { hideNotification } from "redux/game/localPersonalSlice.js";
import { MdClose } from "react-icons/md";
import css from "./InfoMessage.module.scss";

export default function InfoMessage() {
  const dispatch = useDispatch();
  const {
    message = "",
    duration = 1000,
    type = "info",
  } = useSelector(selectNotification);
  const timerRef = useRef(null);
  const infoMessageRef = useRef(null); // Реф для контейнера InfoMessage

  const handleClose = useCallback(() => {
    // console.log("handleClose");
    dispatch(hideNotification());

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [dispatch]);

  // Створення таймеру і закриття по таймеру
  useEffect(() => {
    // message має бути в залежностях, бо інакше таймер не створиться при появі другого повідомлення.
    if (!message) return;

    // Очищення попереднього таймеру
    if (timerRef.current) clearTimeout(timerRef.current);

    // Новий таймер
    timerRef.current = setTimeout(() => {
      dispatch(hideNotification());
      // typeof onClose === "function" гарантує, що onClose викликається лише якщо це функція.
      // if (onClose && typeof onClose === "function") onClose();
      timerRef.current = null;
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dispatch, duration, message]);

  // Обробка кліків поза InfoMessage
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        infoMessageRef.current &&
        !infoMessageRef.current.contains(event.target)
      ) {
        // Клік відбувся поза InfoMessage
        dispatch(hideNotification());

        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        handleClose();
      }
    };

    // слухач подій
    if (message) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dispatch, handleClose, message]);

  // якщо повідомлення немає
  if (!message) return null;

  return (
    <>
      <div
        className={`${css.infoMessage} ${css[type] || ""}`}
        ref={infoMessageRef}>
        {message}
        <button className={css.infoMessageIconContainer} onClick={handleClose}>
          <MdClose />
        </button>
      </div>
    </>
  );
}
