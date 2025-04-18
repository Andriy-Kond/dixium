import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "notiflix";
import { clearActiveAction } from "redux/game/gameSlice.js";
import socket from "services/socket.js";

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
  playerGuessSuccess,
  playerVoteSuccess,
  roundFinishSuccess,
  startNewRoundSuccess,
  nextStorytellerUpdated,
  gameEnd,
  gameFindActiveSuccess,
} from "./socketHandlers";
import { votingStarted } from "./socketHandlers/votingStarted.js";
import { useTranslation } from "react-i18next";
import { selectUserCredentials } from "redux/selectors/selectorsAuthSlice.js";
import { selectActiveActions } from "redux/selectors/selectorsGameSlice.js";
import { selectToastId } from "redux/selectors/selectorsLocalPersonalSlice.js";

export const useSetupSocketListeners = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: userId } = userCredentials;
  const location = useLocation();
  const match = location.pathname.match(/game\/([\w\d]+)/);
  const gameId = match ? match[1] : null;
  const activeActions = useSelector(selectActiveActions);
  const toastId = useSelector(selectToastId(gameId));

  useEffect(() => {
    joinToGameRoom(socket, gameId, userCredentials); // Handle of initial connection

    // Обробка події "connect": перше або повторне підключення після оновлення сторінки
    const handleConnect = () => joinToGameRoom(socket, gameId, userCredentials);

    // Обробка події "reconnect": перепідключення після втрати з'єднання (через мережеві проблеми)
    const handleReconnect = () =>
      joinToGameRoom(socket, gameId, userCredentials);

    const handleError = err => {
      let errMessage = "";
      // console.log("err.errorMessage:::", err.errorMessage);

      switch (err.errorMessage) {
        case "Error creating game: You already have an active game. Finish or delete it first.":
          errMessage = t("player_has_active_game");
          break;

        default:
          errMessage = err.errorMessage;
          break;
      }

      Notify.failure(errMessage);
    };

    const handleGameFirstTurnUpdate = ({ game }) =>
      gameFirstTurnUpdate(game, dispatch, userId);

    const handleGameCreateOrUpdate = ({ game, isNew }) =>
      gameCreateOrUpdate(game, isNew, dispatch);

    const handlePlayerJoined = ({ game, player, message }) =>
      playerJoined(
        game._id,
        player,
        message,
        userCredentials,
        gameId,
        navigate,
      );

    const handleUserDeletedFromGame = ({ game }) =>
      userDeletedFromGame(game, dispatch);

    const handleGameDeleted = ({ game, message }) => {
      gameDelete(
        game._id,
        message,
        dispatch,
        gameId,
        userId,
        navigate,
        toastId,
      );
    };

    const handlePlayersOrderUpdate = ({ game, message }) =>
      playersOrderUpdate(game, message, dispatch, activeActions);

    const handleGameRun = ({ game, message }) => {
      gameRun(game, message, dispatch, activeActions, userId);
    };

    const handleFirstStorytellerUpdated = ({ game }) => {
      firstStorytellerUpdated(game, dispatch, userId);
    };

    const handleNextStorytellerUpdated = ({ game }) => {
      nextStorytellerUpdated(game, dispatch, userId);
    };

    const handlePlayerGuessSuccess = ({ game }) =>
      playerGuessSuccess(game, dispatch);

    const handleVotingStarted = ({ game }) => {
      votingStarted(game, dispatch, userId);
    };

    const handlePlayerVoteSuccess = ({ game, message }) =>
      playerVoteSuccess(game, message, dispatch, activeActions);

    const handleRoundFinishSuccess = ({ game, message }) =>
      roundFinishSuccess(game, message, dispatch, activeActions, userId);

    const handleStartNewRoundSuccess = ({ game, message }) =>
      startNewRoundSuccess(game, message, dispatch, activeActions, userId);

    // startNewRoundSuccess;

    const handleGameEnd = ({ game, message }) =>
      gameEnd(game, message, dispatch);

    const handleGameFindActiveSuccess = ({ game, message, gameNumber }) =>
      gameFindActiveSuccess(game, message, gameNumber, dispatch);

    socket.on("connect", handleConnect);
    socket.on("reconnect", handleReconnect);
    socket.on("error", handleError);

    socket.on("gameFirstTurnUpdated", handleGameFirstTurnUpdate);
    socket.on("gameCreatedOrUpdated", handleGameCreateOrUpdate);
    socket.on("playerJoined", handlePlayerJoined);
    socket.on("userDeletedFromGame", handleUserDeletedFromGame);
    socket.on("gameWasDeleted", handleGameDeleted);

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
    socket.on("gameFindActiveSuccess", handleGameFindActiveSuccess);

    return () => {
      // console.log("Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("reconnect", handleReconnect);
      socket.off("error", handleError);

      socket.off("gameFirstTurnUpdated", handleGameFirstTurnUpdate);
      socket.off("gameCreatedOrUpdated", handleGameCreateOrUpdate);
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("userDeletedFromGame", handleUserDeletedFromGame);
      socket.off("gameWasDeleted", handleGameDeleted);

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
      socket.off("gameFindActiveSuccess", handleGameFindActiveSuccess);

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
    dispatch,
    gameId,
    navigate,
    t,
    toastId,
    userCredentials,
    userId,
  ]);
};
