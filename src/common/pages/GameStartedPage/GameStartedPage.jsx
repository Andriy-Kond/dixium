import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Notify } from "notiflix";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import socket from "socket.js";
import { updateGame } from "features/game/gameSlice.js";
import { selectGame, selectUserCredentials } from "app/selectors.js";
import Button from "common/components/Button/index.js";
import css from "./GameStartedPage.module.scss";

import { distributeCards } from "features/utils/distributeCards.js";

// Компонент для кожного гравця, що додає drag-and-drop функціонал
const SortablePlayer = ({ player, styles }) => {
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
  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectGame(currentGameId));

  const prevRunGameStateRef = useRef(null);
  const timeoutRunGameRef = useRef(null);

  const prevDnDGameStateRef = useRef(null);
  const timeoutDnDRef = useRef(null);

  useEffect(() => {
    const handlePlayerJoined = ({ game, message }) => {
      dispatch(updateGame(game)); // update gameSlice state
      Notify.success(message); // Notify about new player
    };

    const handleGameDeleted = data => {
      if (data.message) {
        Notify.failure(data.message);
      } else {
        navigate(`/game`, { replace: true });
      }
    };

    const handleNewPlayerUpdated = game => {
      clearTimeout(timeoutDnDRef.current);
      if (game.message) {
        dispatch(updateGame(prevDnDGameStateRef.current));
        prevDnDGameStateRef.current = null;
        Notify.failure(game.message);
      } else {
        dispatch(updateGame(game));
        prevDnDGameStateRef.current = null;
      }
    };

    const handleGameRunning = game => {
      clearTimeout(timeoutRunGameRef.current); // clear timeout because server responded just now

      // If there is a message, then it is an error, rollback of the state
      if (game.message) {
        dispatch(updateGame(prevRunGameStateRef.current));
        prevRunGameStateRef.current = null;
        Notify.failure(game.message);
      } else {
        // Server response or response late (more then 5 sec) -> state update
        dispatch(updateGame(game));
        prevRunGameStateRef.current = null;
      }
    };

    socket.on("playerJoined", handlePlayerJoined);
    socket.on("currentGameWasDeleted", handleGameDeleted); // return to gamesList
    socket.on("playersOrderUpdated", handleNewPlayerUpdated);
    socket.on("currentGame:running", handleGameRunning);

    return () => {
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("currentGameWasDeleted", handleGameDeleted);
      socket.off("playersOrderUpdated", handleNewPlayerUpdated);
      socket.off("currentGame:running", handleGameRunning);
      clearTimeout(timeoutDnDRef.current);
      clearTimeout(timeoutRunGameRef.current); // if client runout from page (unmount component) before server responding
    };
  }, [dispatch, navigate]);

  const runGame = () => {
    const updatedGame = distributeCards(currentGame);
    if (updatedGame.message) return Notify.failure(updatedGame.message); // "Not enough cards in the deck"

    dispatch(updateGame(updatedGame)); // optimistic update
    prevRunGameStateRef.current = prevRunGameStateRef.current || updatedGame;

    socket.emit("currentGame:run", updatedGame);

    // Timer for waiting of server response (5 sec)
    timeoutRunGameRef.current = setTimeout(() => {
      // If server not respond within 5 sec:
      if (prevRunGameStateRef.current) {
        Notify.failure("No response from server. Reverting game state.");
        dispatch(updateGame(prevRunGameStateRef.current));
        prevRunGameStateRef.current = null;
      }
    }, 5000); // 5 секунд таймаут
  };

  // Оновлює порядок гравців і надсилає зміни через сокети.
  const handleDragEnd = event => {
    if (currentGame.hostPlayerId !== userCredentials._id) return; // dnd can do the host player only

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
    dispatch(updateGame(updatedGame)); // optimistic update
    prevDnDGameStateRef.current = prevDnDGameStateRef.current || updatedGame;

    socket.emit("newPlayersOrder", updatedGame);

    // Timer for waiting of server response (5 sec)
    timeoutDnDRef.current = setTimeout(() => {
      // If server not respond within 5 sec:
      if (prevDnDGameStateRef.current) {
        Notify.failure("No response from server. Reverting players order.");
        dispatch(updateGame(prevDnDGameStateRef.current));
        prevDnDGameStateRef.current = null;
      }
    }, 5000); // 5 секунд таймаут
  };

  const toPreviousPage = () => {
    navigate(`/game`);
  };

  return (
    <>
      <p>Game Started Page</p>

      <div className={css.container}>
        <div className={css.pageHeader}>
          <p className={css.pageHeader_title}>
            {`Game "${currentGame?.gameName}"`.toUpperCase()}
          </p>
        </div>
        <div className={css.pageMain}>
          {/* DndContext контролює процес перетягування */}
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
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
                    key={player._id}
                    player={player}
                    styles={`${css.item} 
                        ${
                          currentGame.hostPlayerId === userCredentials._id &&
                          css.host
                        }`}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>

          <div className={css.bottomBar}>
            <Button
              onClick={toPreviousPage}
              btnText={"Back"}
              btnStyle={["twoBtnsInRow"]}
            />
            {userCredentials._id === currentGame?.hostPlayerId && (
              <Button
                onClick={runGame}
                btnText={"Run game"}
                btnStyle={["twoBtnsInRow"]}
                disabled={
                  currentGame.players.length < 3 ||
                  currentGame.players.length > 12
                }
              />
            )}
          </div>
        </div>
      </div>

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
