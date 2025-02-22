import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import socket from "socket.js";
import { Notify } from "notiflix";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectGames } from "app/selectors.js";
import { updateGame } from "features/game/gameSlice.js";

export default function GameStartedPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentGameId } = useParams();
  const games = useSelector(selectGames);

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
      console.log("useEffect >> game:::", game);
      if (game) dispatch(updateGame(game));
    };

    socket.on("currentGameWasDeleted", handleGameDeleted); // return to gamesList
    socket.on("playerJoined", handleNewPlayerJoined);
    socket.on("playersOrderUpdated", handleNewPlayerUpdated);

    return () => {
      socket.off("currentGameWasDeleted", handleGameDeleted);
      socket.off("playerJoined", handleNewPlayerJoined);
      socket.off("playersOrderUpdated", handleNewPlayerUpdated);
    };
  }, [dispatch, navigate]);

  const handleDragEnd = result => {
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

      <ul>
        {currentGame?.players.map(player => (
          <li key={player._id}>{player.name}</li>
        ))}
      </ul>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="players-list">
          {provided => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {currentGame?.players.map((player, index) => (
                <Draggable
                  key={player._id}
                  draggableId={player._id}
                  index={index}>
                  {provided => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        padding: "10px",
                        margin: "5px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "5px",
                        cursor: "grab",
                        ...provided.draggableProps.style,
                      }}>
                      {player.name}
                    </li>
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
