import { Notify } from "notiflix";
import socket from "socket.js";
import { updateGame } from "features/game/gameSlice.js";
import { useGameRefs } from "features/hooks/useGameRefs.js";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

export const useSetupSocketListeners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    prevRunGameStateRef,
    timeoutRunGameRef,
    prevDnDGameStateRef,
    timeoutDnDRef,
  } = useGameRefs();

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
    clearTimeout(timeoutRunGameRef.current);

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
  socket.on("currentGameWasDeleted", handleGameDeleted);
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
};
