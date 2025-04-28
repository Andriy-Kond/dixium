import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { Notify } from "notiflix";
import { clearActiveAction } from "redux/game/gameSlice.js";
import socket from "services/socket.js";
import {
  selectActiveActions,
  selectLocalGames,
  selectToastId,
  selectUserCredentials,
} from "redux/selectors.js";

import {
  firstStorytellerUpdated,
  gameDeleted,
  gameRun,
  gameFirstTurnUpdate,
  joinToGameRoom,
  playerJoined,
  playersOrderUpdate,
  userDeletedFromGame,
  playerGuessSuccess,
  playerVoteSuccess,
  roundFinishSuccess,
  startNewRoundSuccess,
  nextStorytellerUpdated,
  gameEnd,
  gameFound,
  gameCreated,
  updateUserCredentials,
  userActiveGameIdUpdate,
  showError,
  socketConnection,
} from "./socketHandlers";
import { votingStarted } from "./socketHandlers/votingStarted.js";
import { useTranslation } from "react-i18next";

export const useSetupSocketListeners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const match = location.pathname.match(/game\/([\w\d]+)/);
  const gameId = match ? match[1] : null;

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: userId } = userCredentials;
  const toastId = useSelector(selectToastId(gameId));
  const activeActions = useSelector(selectActiveActions);
  const games = useSelector(selectLocalGames);

  const handleSocketConnection = useCallback(
    event => socketConnection(event, socket, userId, gameId),
    [gameId, userId],
  );

  // для дебагу
  const handleDisconnect = useCallback(
    () => console.log(`Socket disconnected, socket.id: ${socket.id}`),
    [],
  );

  const handleError = useCallback(err => showError(err, t), [t]);

  // Перше або повторне підключення після оновлення сторінки чи втрати з'єднання
  const handleUpdateUserCredentials = useCallback(
    ({ user }) => updateUserCredentials(user, dispatch),
    [dispatch],
  );

  const handleUserActiveGameIdUpdate = useCallback(
    ({ userActiveGameId }) =>
      userActiveGameIdUpdate(userActiveGameId, dispatch),
    [dispatch],
  );

  const handleGameFirstTurnUpdate = useCallback(
    ({ game }) => gameFirstTurnUpdate(game, dispatch, userId),
    [dispatch, userId],
  );

  const handleGameCreated = useCallback(
    ({ game }) => {
      if (game.hostPlayerId === userId) gameCreated(game, dispatch);
    },
    [dispatch, userId],
  );

  const handlePlayerJoined = useCallback(
    ({ game, player, message }) =>
      playerJoined({
        game,
        player,
        message,
        userId,
        currentGameId: gameId,
        navigate,
        dispatch,
      }),
    [dispatch, gameId, navigate, userId],
  );

  const handleUserDeletedFromGame = useCallback(
    ({ game, deletedUser }) =>
      userDeletedFromGame({
        game,
        deletedUser,
        userId,
        dispatch,
        navigate,
      }),
    [dispatch, navigate, userId],
  );

  const handleGameDeleted = useCallback(
    ({ game }) => {
      if (games[game._id])
        gameDeleted(game, dispatch, gameId, userId, navigate, toastId);
    },
    [dispatch, gameId, games, navigate, toastId, userId],
  );

  const handlePlayersOrderUpdate = useCallback(
    ({ game, message }) =>
      playersOrderUpdate(game, message, dispatch, activeActions),
    [activeActions, dispatch],
  );

  const handleGameRun = useCallback(
    ({ game, message }) =>
      gameRun(game, message, dispatch, activeActions, userId),
    [activeActions, dispatch, userId],
  );

  const handleFirstStorytellerUpdated = useCallback(
    ({ game }) => firstStorytellerUpdated(game, dispatch, userId),
    [dispatch, userId],
  );

  const handleNextStorytellerUpdated = useCallback(
    ({ game }) => nextStorytellerUpdated(game, dispatch, userId),
    [dispatch, userId],
  );

  const handlePlayerGuessSuccess = useCallback(
    ({ game }) => playerGuessSuccess(game, dispatch),
    [dispatch],
  );

  const handleVotingStarted = useCallback(
    ({ game }) => votingStarted(game, dispatch, userId),
    [dispatch, userId],
  );

  const handlePlayerVoteSuccess = useCallback(
    ({ game, message }) =>
      playerVoteSuccess(game, message, dispatch, activeActions),
    [activeActions, dispatch],
  );

  const handleRoundFinishSuccess = useCallback(
    ({ game, message }) =>
      roundFinishSuccess(game, message, dispatch, activeActions, userId),
    [activeActions, dispatch, userId],
  );

  const handleStartNewRoundSuccess = useCallback(
    ({ game, message }) =>
      startNewRoundSuccess(game, message, dispatch, activeActions, userId),
    [activeActions, dispatch, userId],
  );

  const handleGameEnd = useCallback(
    ({ game, message }) => gameEnd(game, message, dispatch),
    [dispatch],
  );

  const handleGameFound = useCallback(
    ({ game }) => gameFound(game, dispatch),
    [dispatch],
  );

  useEffect(() => {
    console.log(`Setting up socket listeners for component ${Math.random()}`); // дебаг унікальності

    socket.on("disconnect", handleDisconnect);

    socket.on("connect", () => handleSocketConnection("connect"));
    socket.on("reconnect", () => handleSocketConnection("reconnect"));
    if (socket.connected) handleSocketConnection(); // якщо сокет уже підключений, то одразу викликати
    socket.on("error", handleError);

    socket.on("updateUserCredentials", handleUpdateUserCredentials);
    socket.on("UserActiveGameId:Update", handleUserActiveGameIdUpdate);

    socket.on("gameFirstTurnUpdated", handleGameFirstTurnUpdate);

    socket.on("gameCreated", handleGameCreated);

    // socket.on("gameEntry", handleGameEntry);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("userDeletedFromGame", handleUserDeletedFromGame);
    socket.on("Game:Deleted", handleGameDeleted);

    socket.on("playersOrderUpdated", handlePlayersOrderUpdate);
    socket.on("gameRunning", handleGameRun);

    socket.on("firstStorytellerUpdated", handleFirstStorytellerUpdated);
    socket.on("nextStorytellerUpdated", handleNextStorytellerUpdated);
    socket.on("playerGuessSuccess", handlePlayerGuessSuccess);
    socket.on("votingStarted", handleVotingStarted);
    socket.on("playerVoteSuccess", handlePlayerVoteSuccess);
    socket.on("roundFinishSuccess", handleRoundFinishSuccess);
    socket.on("startNewRoundSuccess", handleStartNewRoundSuccess);

    socket.on("gameEnd", handleGameEnd);
    socket.on("gameFound", handleGameFound);

    return () => {
      // console.log("Cleaning up socket listeners");
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", () => handleSocketConnection("connect"));
      socket.off("reconnect", () => handleSocketConnection("reconnect"));
      socket.off("error", handleError);

      socket.off("updateUserCredentials", handleUpdateUserCredentials);
      socket.off("UserActiveGameId:Update", handleUserActiveGameIdUpdate);

      socket.off("gameFirstTurnUpdated", handleGameFirstTurnUpdate);

      socket.off("gameCreated", handleGameCreated);

      socket.off("playerJoined", handlePlayerJoined);
      socket.off("userDeletedFromGame", handleUserDeletedFromGame);
      socket.off("Game:Deleted", handleGameDeleted);

      socket.off("playersOrderUpdated", handlePlayersOrderUpdate);
      socket.off("gameRunning", handleGameRun);

      socket.off("firstStorytellerUpdated", handleFirstStorytellerUpdated);
      socket.off("nextStorytellerUpdated", handleNextStorytellerUpdated);
      socket.off("playerGuessSuccess", handlePlayerGuessSuccess);
      socket.off("votingStarted", handleVotingStarted);
      socket.off("playerVoteSuccess", handlePlayerVoteSuccess);
      socket.off("roundFinishSuccess", handleRoundFinishSuccess);
      socket.off("startNewRoundSuccess", handleStartNewRoundSuccess);

      socket.off("gameEnd", handleGameEnd);
      socket.off("gameFound", handleGameFound);
    };
  }, [
    dispatch,
    handleDisconnect,
    handleError,
    handleFirstStorytellerUpdated,
    handleGameCreated,
    handleGameDeleted,
    handleGameEnd,
    handleGameFirstTurnUpdate,
    handleGameFound,
    handleGameRun,
    handleNextStorytellerUpdated,
    handlePlayerGuessSuccess,
    handlePlayerJoined,
    handlePlayerVoteSuccess,
    handlePlayersOrderUpdate,
    handleRoundFinishSuccess,
    handleSocketConnection,
    handleStartNewRoundSuccess,
    handleUpdateUserCredentials,
    handleUserActiveGameIdUpdate,
    handleUserDeletedFromGame,
    handleVotingStarted,
  ]);

  // Очищення таймерів
  useEffect(() => {
    return () => {
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
  }, [activeActions, dispatch]);
};
