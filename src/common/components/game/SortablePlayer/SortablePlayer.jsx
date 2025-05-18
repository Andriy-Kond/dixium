import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import socket from "services/socket.js";
import { useTranslation } from "react-i18next";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import {
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";

import { MdDeleteOutline } from "react-icons/md";
import { MdDragIndicator } from "react-icons/md";
import css from "./SortablePlayer.module.scss";
import { useEffect } from "react";
import clsx from "clsx";

// Component for each dnd player
export default function SortablePlayer({ player }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: player._id,
      animateLayoutChanges: () => false, // Вимикає перехід після зміни DOM (прибере різкі стрибки після оновлення стану)
    });
  const userCredentials = useSelector(selectUserCredentials);
  const userActiveGameId = useSelector(selectUserActiveGameId);
  const currentGame = useSelector(selectLocalGame(userActiveGameId));

  useEffect(() => {
    if (!userActiveGameId || !currentGame) {
      navigate("/game", { replace: true });
      return;
    }
  }, [currentGame, navigate, userActiveGameId]);

  // attributes – атрибути для коректної роботи 'aria-*' (доступність).
  // listeners – обробники подій для початку перетягування.
  // setNodeRef – функція для прив'язки DOM-елемента (щоб бібліотека знала, що цей елемент можна перетягувати).
  // transform – містить координати зміщення елемента під час перетягування.
  // transition – CSS-трансформації, які бібліотека додає для анімації перетягування.

  // Вбудовані inline-стилі
  // transform – перетворення (переміщення, масштабування тощо).
  // transition – визначає, як швидко буде відбуватись анімація.
  const style = {
    // opt.1
    transform: CSS.Transform.toString(transform),
    transition,

    // transition: "transform 1s",

    // will-change — це CSS-властивість, яка підказує браузеру, що певний елемент найближчим часом зміниться (наприклад, його transform, opacity або top). Це дозволяє браузеру заздалегідь оптимізувати рендеринг і зробити анімацію або зміни плавнішими.
    // willChange: "transform", // може зменшити "мерехтіння"
  };

  const removePlayer = userId => {
    // console.log(" SortablePlayer >> userId:::", userId);
    if (!currentGame || !currentGame.players) return;

    const players = [...currentGame.players];
    const newPlayers = players.filter(p => p._id !== userId);
    const updatedGame = { ...currentGame, players: newPlayers };

    socket.emit("deleteUserFromGame", { updatedGame, deletedUserId: userId });
  };

  const handleRemovePlayer = e => {
    // console.log("onclick");
    // console.log("Button clicked, userId:", userCredentials._id);
    // e.stopPropagation(); // зупинка поширення події -- не працює
    removePlayer(player._id);
  };

  const isCurrentPlayerIsHost =
    currentGame.hostPlayerId === userCredentials._id;

  const isDisabledDeleteBtn =
    userCredentials._id === player._id || currentGame.isGameRunning;

  const isDisabledDndIcon = currentGame.isGameRunning;

  return (
    <li
      ref={setNodeRef}
      style={style}
      // className={`${css.listItem} ${isCurrentPlayerIsHost && css.host}`}
      className={clsx(css.listItem, {
        [css.host]: isCurrentPlayerIsHost,
        [css.hostDisabled]: isDisabledDndIcon,
      })}>
      <div {...attributes} {...listeners} className={css.dragHandle}>
        {isCurrentPlayerIsHost && (
          <MdDragIndicator
            className={clsx(css.dndIcon, {
              [css.isDisabled]: isDisabledDndIcon,
            })}
          />
        )}

        <p>{`${player.name} ${
          player._id === currentGame.hostPlayerId ? t("the_host") : ""
        }`}</p>
      </div>

      {isCurrentPlayerIsHost && (
        <button
          className={css.deleteBtn}
          disabled={isDisabledDeleteBtn}
          onClick={handleRemovePlayer}>
          <MdDeleteOutline className={css.trashIcon} />
        </button>
      )}
    </li>
  );
}
