import { DndContext, closestCenter, useDndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateGame } from "features/game/gameSlice.js";
import socket from "socket.js";
import css from "./GameStartedPage.module.scss";
import { Notify } from "notiflix";
import { useNavigate, useParams } from "react-router-dom";
import { selectGames, selectUserCredentials } from "app/selectors.js";

// Компонент для кожного гравця, що додає drag-and-drop функціонал
const SortablePlayer = ({ player, styles, active }) => {
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

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles}>
      {player.name}
    </li>
  );
};

export default function GameStartedPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGameId } = useParams();
  const games = useSelector(selectGames);
  const { _id: currentUserId } = useSelector(selectUserCredentials);
  const currentGame = games.find(game => game._id === currentGameId);

  useEffect(() => {
    const handleNewPlayerJoined = ({ game, message }) => {
      dispatch(updateGame(game)); // update gameSlice state
      Notify.success(message); // Notify about new player
    };

    const handleGameDeleted = () => {
      navigate(`/game`, { replace: true });
    };

    const handleNewPlayerUpdated = game => {
      if (game) dispatch(updateGame(game));
      else {
        Notify.failure("Server error: players order not changed");
      }
    };

    socket.on("playerJoined", handleNewPlayerJoined);
    socket.on("currentGameWasDeleted", handleGameDeleted); // return to gamesList
    socket.on("playersOrderUpdated", handleNewPlayerUpdated);

    return () => {
      socket.off("playerJoined", handleNewPlayerJoined);
      socket.off("currentGameWasDeleted", handleGameDeleted);
      socket.off("playersOrderUpdated", handleNewPlayerUpdated);
    };
  }, [dispatch, navigate]);

  // Оновлює порядок гравців і надсилає зміни через сокети.
  const handleDragEnd = event => {
    if (currentGame.hostPlayerId !== currentUserId) return; // dnd can do the host player only

    const { active, over } = event;

    // Щоб зайвий раз не змінювати порядок масиву, якщо фактично нічого не змінилося:
    if (!over || active.id === over.id) return;
    // Якщо over дорівнює null або undefined, то це означає, що елемент не був перетягнутий на інший елемент.
    // Якщо active.id === over.id означає, що елемент перетягнули на те ж саме місце, де він і був.

    const oldIndex = currentGame.players.findIndex(p => p._id === active.id);
    const newIndex = currentGame.players.findIndex(p => p._id === over.id);

    // Зміна порядку елементів у масиві
    // arrayMove — це функція з @dnd-kit/sortable, яка бере масив і повертає новий масив із переміщеним елементом.
    const newPlayersOrder = arrayMove(currentGame.players, oldIndex, newIndex); // переміщує елемент з oldIndex на newIndex

    const updatedGame = { ...currentGame, players: newPlayersOrder };
    dispatch(updateGame(updatedGame));
    socket.emit("newPlayersOrder", {
      gameId: currentGameId,
      players: newPlayersOrder,
    });
  };

  const { active } = useDndContext();

  return (
    <>
      <p>Game Started Page</p>
      <p>{currentGame?.gameName}</p>
      {/* DndContext контролює процес перетягування */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext // Дозволяє сортувати список гравців.
          items={currentGame?.players.map(p => p._id)}
          strategy={verticalListSortingStrategy}
          // strategy визначає, як відбувається сортування перетягуваних елементів.
          // verticalListSortingStrategy працює для вертикальних списків (коли елементи розташовані зверху вниз).
          // Інші стратегії:
          // rectSortingStrategy — працює для сіткових (grid) структур.
          // horizontalListSortingStrategy — підходить для горизонтального списку.
          // verticalListSortingStrategy — для звичайних вертикальних списків.
          // sortableKeyboardCoordinates — використовується для керування перетягуванням через клавіатуру.
          // Кожна з цих стратегій впливає на поведінку перетягування: як переміщуються елементи, як обчислюється їхній порядок, чи змінюється простір між ними тощо.
        >
          <ul>
            {currentGame?.players.map(player => (
              <SortablePlayer
                active={active}
                key={player._id}
                player={player}
                styles={`${css.item} 
                        ${
                          currentGame.hostPlayerId === currentUserId && css.host
                        }`}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      {/* <ul>
        {currentGame?.players.map(player => {
          const { hostPlayerId } = currentGame;
          return (
            <li
              key={player._id}
              className={`${css.item} 
                        ${hostPlayerId === currentUserId && css.host}`}>
              {player.name}
            </li>
          );
        })}
      </ul> */}
    </>
  );
}
