import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "notiflix";
import { clearActiveAction, updateGame } from "redux/game/gameSlice.js";
import socket from "services/socket.js";
import { selectActiveActions, selectUserCredentials } from "redux/selectors.js";

import { useGetAllGamesQuery } from "redux/game/gameApi.js";
import {
  firstStorytellerUpdated,
  gameCreateOrUpdate,
  gameDelete,
  gameRun,
  gameFirstTurnUpdate,
  joinToGameRoom,
  playerJoined,
  playersOrderUpdate,
  userDeletedFromGame,
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

    const handleError = err => Notify.failure(err.errorMessage);

    const handleGameFirstTurnUpdate = ({ game }) =>
      gameFirstTurnUpdate(game, dispatch);

    const handleGameCreateOrUpdate = ({ game }) =>
      gameCreateOrUpdate(game, dispatch);

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

    const handleFirstStorytellerUpdated = ({ game }) =>
      firstStorytellerUpdated(game, dispatch);

    const handleUserDeletedFromGame = ({ game }) =>
      userDeletedFromGame(game, dispatch);

    socket.on("connect", handleConnect);
    socket.on("reconnect", handleReconnect);
    socket.on("error", handleError);

    socket.on("gameFirstTurnUpdated", handleGameFirstTurnUpdate);
    socket.on("gameCreatedOrUpdated", handleGameCreateOrUpdate);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("gameWasDeleted", handleGameDeleted);

    socket.on("playersOrderUpdated", handlePlayersOrderUpdate);
    socket.on("gameRunning", handleGameRun);

    socket.on("firstStorytellerUpdated", handleFirstStorytellerUpdated);
    socket.on("userDeletedFromGame", handleUserDeletedFromGame);

    return () => {
      // console.log("Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("reconnect", handleReconnect);
      socket.off("error", handleError);

      socket.on("gameFirstTurnUpdated", handleGameFirstTurnUpdate);
      socket.off("gameCreatedOrUpdated", handleGameCreateOrUpdate);
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("gameWasDeleted", handleGameDeleted);

      socket.off("playersOrderUpdated", handlePlayersOrderUpdate);
      socket.off("gameRunning", handleGameRun);

      socket.off("firstStorytellerUpdated", handleFirstStorytellerUpdated);
      socket.off("userDeletedFromGame", handleUserDeletedFromGame);

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
