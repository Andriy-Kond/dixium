import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import css from "./GameStartedPage.module.scss";

import socket from "socket.js";
import { Notify } from "notiflix";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectGames, selectUserCredentials } from "app/selectors.js";
import { updateGame } from "features/game/gameSlice.js";

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

  const handleDragEnd = result => {
    if (currentGame.hostPlayerId !== currentUserId) return; // dnd дозволяємо лише хосту
    if (!result.destination) return; // Якщо елемент не перетягнули в нове місце

    const newPlayersOrder = Array.from(currentGame.players); // Поверхнева копія масиву. Те саме що і  const newPlayersOrder = [...currentGame.players]; -
    const [movedPlayer] = newPlayersOrder.splice(result.source.index, 1);
    newPlayersOrder.splice(result.destination.index, 0, movedPlayer);

    // Оновлення стану гри
    socket.emit("newPlayersOrder", {
      gameId: currentGameId,
      players: newPlayersOrder,
    });
  };

  return (
    <>
      <p>Game Started Page</p>
      <p>{currentGame?.gameName}</p>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="players-list">
          {provided => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={css.list}>
              {currentGame?.players.map((player, index) => (
                <Draggable
                  key={player._id}
                  draggableId={player._id}
                  index={index} // позиція елемента у списку
                  // Блокування перетягування:
                  isDragDisabled={currentGame.hostPlayerId !== currentUserId}>
                  {(provided, snapshot) => (
                    <li
                      className={`${css.item} 
                        ${
                          currentGame.hostPlayerId === currentUserId && css.host
                        } 
                        ${
                          currentUserId !== currentGame?.hostPlayerId &&
                          css.inactive
                        }`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      // Заборона перетягування:
                      {...(currentGame.hostPlayerId === currentUserId
                        ? provided.dragHandleProps // Якщо не вказати, то елемент можна тягнути будь-де. Якщо вказати – перетягування працює лише на певній частині.
                        : {})}
                      // <li {...provided.draggableProps}> // варіант без обмежень
                      // <div {...provided.dragHandleProps}>☰</div> // Варіант, де тягнути можна лише за певну область

                      // Вбудовані стилі, які керують анімацією руху під час перетягування:
                      style={{
                        ...provided.draggableProps.style,
                      }}>
                      {player.name}
                    </li>
                  )}
                </Draggable>
              ))}
              {/*provided.placeholder - віртуальне місце, яке зберігає висоту контейнера під час перетягування */}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}
