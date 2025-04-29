import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { clearActiveAction } from "redux/game/gameSlice.js";
import socket from "services/socket.js";
import {
  selectActiveActions,
  selectIsGameRunning,
  selectLocalGames,
  selectToastId,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";

import {
  firstStorytellerUpdated,
  gameDeleted,
  gameRunning,
  gameFirstTurnUpdate,
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
  joinToGameRoom,
  gameStarted,
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
  const userActiveGameId = useSelector(selectUserActiveGameId);
  const isGameRunning = useSelector(selectIsGameRunning(gameId));

  useEffect(() => {
    const handleSocketConnection = event => {
      socketConnection(event, userId, gameId);

      if (isGameRunning && gameId && userActiveGameId === gameId)
        joinToGameRoom(gameId, userId);
    };

    const handleError = err => showError(err, t);

    // Перше або повторне підключення після оновлення сторінки чи втрати з'єднання
    const handleUpdateUserCredentials = ({ user }) =>
      updateUserCredentials(user, dispatch);

    const handleUserActiveGameIdUpdate = ({ userActiveGameId }) =>
      userActiveGameIdUpdate(userActiveGameId, dispatch);

    const handleGameFirstTurnUpdate = ({ game }) =>
      gameFirstTurnUpdate(game, dispatch, userId);

    const handleGameCreated = ({ game }) => {
      if (game.hostPlayerId === userId) gameCreated(game, dispatch);
    };

    const handlePlayerJoined = ({ game, player, message }) =>
      playerJoined({
        game,
        player,
        message,
        userId,
        currentGameId: gameId,
        navigate,
        dispatch,
      });

    const handleUserDeletedFromGame = ({ game, deletedUser }) =>
      userDeletedFromGame({
        game,
        deletedUser,
        userId,
        dispatch,
        navigate,
      });

    const handleGameDeleted = ({ game }) => {
      if (games[game._id])
        gameDeleted(game, dispatch, gameId, userId, navigate, toastId);
    };

    const handlePlayersOrderUpdate = ({ game, message }) =>
      playersOrderUpdate(game, message, dispatch, activeActions);

    const handleGameRunning = ({ game, message }) =>
      gameRunning(games, game, message, dispatch, activeActions, userId);

    const handleFirstStorytellerUpdated = ({ game }) =>
      firstStorytellerUpdated(game, dispatch, userId);

    const handleNextStorytellerUpdated = ({ game }) =>
      nextStorytellerUpdated(game, dispatch, userId);

    const handlePlayerGuessSuccess = ({ game }) =>
      playerGuessSuccess(game, dispatch);

    const handleVotingStarted = ({ game }) =>
      votingStarted(game, dispatch, userId);

    const handlePlayerVoteSuccess = ({ game, message }) =>
      playerVoteSuccess(game, message, dispatch, activeActions);

    const handleRoundFinishSuccess = ({ game, message }) =>
      roundFinishSuccess(game, message, dispatch, activeActions, userId);

    const handleStartNewRoundSuccess = ({ game, message }) =>
      startNewRoundSuccess(game, message, dispatch, activeActions, userId);

    const handleGameEnd = ({ game, message }) =>
      gameEnd(game, message, dispatch);

    const handleGameFound = ({ game }) => gameFound(game, dispatch);

    const handleGameStarted = ({ game }) => gameStarted(game, games, dispatch);

    // console.log(`Setting up socket listeners for component ${Math.random()}`); // дебаг унікальності
    socket.on("connect", () => handleSocketConnection("connect"));
    socket.on("reconnect", () => handleSocketConnection("reconnect"));
    if (socket.connected) handleSocketConnection(); // якщо сокет уже підключений, то одразу викликати
    socket.on("error", handleError);

    socket.on("updateUserCredentials", handleUpdateUserCredentials);
    socket.on("UserActiveGameId:Update", handleUserActiveGameIdUpdate);
    socket.on("gameFirstTurnUpdated", handleGameFirstTurnUpdate);
    socket.on("gameCreated", handleGameCreated);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("userDeletedFromGame", handleUserDeletedFromGame);
    socket.on("Game:Deleted", handleGameDeleted);
    socket.on("playersOrderUpdated", handlePlayersOrderUpdate);
    socket.on("Game_Running", handleGameRunning);
    socket.on("firstStorytellerUpdated", handleFirstStorytellerUpdated);
    socket.on("nextStorytellerUpdated", handleNextStorytellerUpdated);
    socket.on("playerGuessSuccess", handlePlayerGuessSuccess);
    socket.on("votingStarted", handleVotingStarted);
    socket.on("playerVoteSuccess", handlePlayerVoteSuccess);
    socket.on("roundFinishSuccess", handleRoundFinishSuccess);
    socket.on("startNewRoundSuccess", handleStartNewRoundSuccess);
    socket.on("gameEnd", handleGameEnd);
    socket.on("gameFound", handleGameFound);
    socket.on("Game_Started", handleGameStarted);

    return () => {
      // console.log("Cleaning up socket listeners");
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
      socket.off("Game_Running", handleGameRunning);
      socket.off("firstStorytellerUpdated", handleFirstStorytellerUpdated);
      socket.off("nextStorytellerUpdated", handleNextStorytellerUpdated);
      socket.off("playerGuessSuccess", handlePlayerGuessSuccess);
      socket.off("votingStarted", handleVotingStarted);
      socket.off("playerVoteSuccess", handlePlayerVoteSuccess);
      socket.off("roundFinishSuccess", handleRoundFinishSuccess);
      socket.off("startNewRoundSuccess", handleStartNewRoundSuccess);
      socket.off("gameEnd", handleGameEnd);
      socket.off("gameFound", handleGameFound);
      socket.on("Game_Started", handleGameStarted);
    };
  }, [
    activeActions,
    dispatch,
    gameId,
    games,
    isGameRunning,
    navigate,
    t,
    toastId,
    userActiveGameId,
    userId,
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
