import { FaRegTrashAlt } from "react-icons/fa";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import css from "./SortablePlayer.module.scss";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectGame, selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button/index.js";
import socket from "services/socket.js";

// Component for each dnd player
export default function SortablePlayer({ player }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: player._id,
      animateLayoutChanges: () => false, // Вимикає перехід після зміни DOM (прибере різкі стрибки після оновлення стану)
    });

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

  const { gameId } = useParams();
  const currentGame = useSelector(selectGame(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const isCurrentPlayerIsHost =
    currentGame.hostPlayerId === userCredentials._id;

  const removePlayer = userId => {
    // console.log(" SortablePlayer >> userId:::", userId);
    if (!currentGame || !currentGame.players) return;

    const players = [...currentGame.players];
    const newPlayers = players.filter(p => p._id !== userId);
    const updatedGame = { ...currentGame, players: newPlayers };

    socket.emit("deleteUserFromGame", { updatedGame });
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${css.item}
                ${isCurrentPlayerIsHost && css.host}`}>
      <div {...attributes} {...listeners} className={css.dragHandle}>
        {player.name.toUpperCase()}
      </div>
      <Button
        disabled={!isCurrentPlayerIsHost}
        onClick={e => {
          // console.log("onclick");
          // console.log("Button clicked, userId:", userCredentials._id);
          e.stopPropagation(); // зупинка поширення події не працює

          removePlayer(player._id);
        }}
        btnStyle={["btnTransparentBorder"]}
        localClassName={css.removePlayerBtn}>
        <FaRegTrashAlt />
      </Button>
    </li>
  );
}
