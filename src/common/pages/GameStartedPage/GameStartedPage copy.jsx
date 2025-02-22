import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";

import socket from "socket.js";
import { Notify } from "notiflix";
import { useEffect, useRef, useState } from "react";
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

  const [localPlayers, setLocalPlayers] = useState(currentGame?.players || []);
  const prevPlayersRef = useRef(localPlayers);

  useEffect(() => {
    setLocalPlayers(currentGame?.players || []);
  }, [currentGame?.players]);

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

    // const newPlayersOrder = Array.from(currentGame.players); // Поверхнева копія масиву. Те саме що і  const newPlayersOrder = [...currentGame.players]; -
    const newPlayersOrder = [...localPlayers];
    const [movedPlayer] = newPlayersOrder.splice(result.source.index, 1);
    newPlayersOrder.splice(result.destination.index, 0, movedPlayer);

    // Зберігаємо попередній стан перед зміною
    prevPlayersRef.current = localPlayers;
    // Оновлюємо локальний стан негайно (щоб не було "миготіння")
    setLocalPlayers(newPlayersOrder);

    // Оновлення стану гри
    socket.emit(
      "newPlayersOrder",
      { gameId: currentGameId, players: newPlayersOrder },
      response => {
        console.log("GameStartedPage >> response:::", response);
        if (response.error) {
          // Якщо сервер повернув помилку — відкочуємо зміни назад
          // setLocalPlayers(currentGame?.players || []);
          setLocalPlayers(prevPlayersRef.current);
          Notify.failure("Server Error: Cannot update players order");
        }
      },
    );
  };

  return (
    <>
      <p>Game Started Page</p>
      <p>{currentGame?.gameName}</p>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="players-list">
          {provided => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {currentGame?.players.map((player, index) => (
                <Draggable
                  key={player._id}
                  draggableId={player._id}
                  index={index}
                  // Блокування перетягування:
                  isDragDisabled={currentGame.hostPlayerId !== currentUserId}>
                  {provided => (
                    <motion.li
                      layout
                      initial={{ opacity: 0.8, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      // {...provided.dragHandleProps}
                      // Заборона перетягування:
                      {...(currentGame.hostPlayerId === currentUserId
                        ? provided.dragHandleProps
                        : {})}
                      style={{
                        transition: "transform 0.2s ease-in-out",
                        opacity:
                          currentUserId !== currentGame?.hostPlayerId ? 0.5 : 1, // Візуально затемнюємо недоступні елементи
                        padding: "10px",
                        margin: "5px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "5px",
                        // cursor: "grab",
                        // Візуальне відображення лише хосту:
                        cursor:
                          currentGame.hostPlayerId === currentUserId
                            ? "grab"
                            : "default",
                        ...provided.draggableProps.style,
                      }}>
                      {player.name}
                    </motion.li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}
