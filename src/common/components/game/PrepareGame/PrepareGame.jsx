import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Notify } from "notiflix";

import { updateGame } from "features/game/gameSlice.js";
import SortablePlayer from "common/components/dnd/SortablePlayer";
import { distributeCards } from "features/utils/distributeCards.js";
import Button from "common/components/Button/index.js";
import { selectGame, selectUserCredentials } from "app/selectors.js";
import css from "./PrepareGame.module.scss";
import { useGameRefs } from "features/hooks/useGameRefs.js";
import socket from "socket.js";

export default function PrepareGame() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    prevRunGameStateRef,
    timeoutRunGameRef,
    prevDnDGameStateRef,
    timeoutDnDRef,
  } = useGameRefs();

  const { currentGameId } = useParams();
  const currentGame = useSelector(selectGame(currentGameId));
  const userCredentials = useSelector(selectUserCredentials);

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
    }, 10000); // 10 секунд таймаут
  };

  const runGame = () => {
    const game = distributeCards(currentGame);
    if (game.message) return Notify.failure(game.message); // "Not enough cards in the deck"

    // optimistic update
    const updatedGame = { ...game, isGameRunning: true }; // todo при закінченні гри зробити false
    dispatch(updateGame(updatedGame));
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
    }, 10000); // 10 секунд таймаут
  };

  const toGamePage = () => {
    navigate(`/game`);
  };

  return (
    <>
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
          onClick={toGamePage}
          btnText={"Back"}
          btnStyle={["twoBtnsInRow"]}
        />
        {userCredentials._id === currentGame?.hostPlayerId && (
          <Button
            onClick={runGame}
            btnText={"Run game"}
            btnStyle={["twoBtnsInRow"]}
            disabled={
              currentGame.players.length < 3 || currentGame.players.length > 12
            }
          />
        )}
      </div>
    </>
  );
}
