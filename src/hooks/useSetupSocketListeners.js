import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "notiflix";
import { clearActiveAction, updateGame } from "redux/game/gameSlice.js";
import socket from "servises/socket.js";
import { selectActiveActions, selectUserCredentials } from "redux/selectors.js";

import { useGetAllGamesQuery } from "redux/game/gameApi.js";
import {
  gameCreateOrUpdate,
  gameDelete,
  gameRun,
  joinToGameRoom,
  playerJoined,
  playersOrderUpdate,
} from "./handlers";

export const useSetupSocketListeners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userCredentials = useSelector(selectUserCredentials);
  const location = useLocation();
  const match = location.pathname.match(/game\/([\w\d]+)/);
  const currentGameId = match ? match[1] : null;
  const activeActions = useSelector(selectActiveActions);

  const { refetch: refetchAllGames } = useGetAllGamesQuery();

  useEffect(() => {
    joinToGameRoom(socket, currentGameId, userCredentials); // Handle of initial connection

    // Обробка події "connect": перше або повторне підключення після оновлення сторінки
    const handleConnect = () =>
      joinToGameRoom(socket, currentGameId, userCredentials);

    // Обробка події "reconnect": перепідключення після втрати з'єднання (через мережеві проблеми)
    const handleReconnect = () =>
      joinToGameRoom(socket, currentGameId, userCredentials);

    const handleError = err => Notify.failure(err.message);

    const handleGameChange = ({ game }) => gameCreateOrUpdate(game, dispatch);

    const handlePlayerJoined = ({ game, player, message }) =>
      playerJoined(
        game,
        player,
        message,
        userCredentials,
        currentGameId,
        navigate,
      );

    const handleGameDeleted = ({ game, message }) =>
      gameDelete(game, message, dispatch, currentGameId, navigate);

    const handlePlayersOrderUpdate = ({ game, message }) =>
      playersOrderUpdate(game, message, dispatch, activeActions);

    const handleGameRun = ({ game, message }) =>
      gameRun(game, message, dispatch, activeActions);

    socket.on("connect", handleConnect);
    socket.on("reconnect", handleReconnect);

    socket.on("gameCreatedOrUpdated", handleGameChange);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("gameWasDeleted", handleGameDeleted);

    socket.on("playersOrderUpdated", handlePlayersOrderUpdate);
    socket.on("gameRunning", handleGameRun);

    socket.on("error", handleError);

    return () => {
      // console.log("Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("reconnect", handleReconnect);

      socket.off("gameCreatedOrUpdated", handleGameChange);
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("gameWasDeleted", handleGameDeleted);

      socket.off("playersOrderUpdated", handlePlayersOrderUpdate);
      socket.off("gameRunning", handleGameRun);

      socket.off("error", handleError);

      // if client runout from page (unmount component) before server responding
      // Очищаємо лише таймери, залишаючи activeActions (на випадок якщо useSetupSocketListeners буде перевикористовуватись у різних компонентах, або при переході між сторінками в рамках одного SPA - тобто монтуватись знову)
      // Очищення всіх таймерів при розмонтуванні
      Object.values(activeActions).forEach(action => {
        if (action?.meta?.timer) {
          clearTimeout(action.meta.timer); // Очищаємо таймер
          const key = `${action.payload.eventName}-${action.payload.updatedGame._id}`;
          dispatch(clearActiveAction(key)); // Видаляємо дію зі стану Redux
        }
      });
    };
  }, [
    activeActions,
    currentGameId,
    dispatch,
    navigate,
    refetchAllGames,
    userCredentials,
  ]);
};
