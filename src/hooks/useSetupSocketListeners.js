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

  const handleConnect = useCallback(() => {
    console.log(`Socket connect event, socket.id: ${socket.id}`);
    if (userId) {
      console.log(
        `Socket connected, registering user ${userId} and joining room`,
      );
      socket.emit("registerUserId", { userId });
      joinToGameRoom(socket, gameId, userId);
    } else {
      console.log("Socket connected, but user is not logged in");
    }
  }, [gameId, userId]);

  const handleReconnect = useCallback(() => {
    console.log(`Socket reconnect event, socket.id: ${socket.id}`);
    if (userId) {
      console.log(
        `Socket reconnected, re-registering user ${userId} and joining room`,
      );
      socket.emit("registerUserId", { userId });
      joinToGameRoom(socket, gameId, userId);
    } else {
      console.log("Socket reconnected, but user is not logged in");
    }
  }, [gameId, userId]);

  const handleDisconnect = useCallback(() => {
    console.log(`Socket disconnected, socket.id: ${socket.id || "undefined"}`);
  }, []);

  const handleError = useCallback(
    err => {
      console.log(`Socket connect_error: ${err}`);
      let errMessage = "";
      switch (err.errorMessage) {
        case "Error creating game: You already have an active game. Finish or delete it first.":
          errMessage = t("player_has_active_game");
          break;
        default:
          errMessage = err.errorMessage;
          break;
      }
      Notify.failure(errMessage);
    },
    [t],
  );

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
      const isGameInList = games[game._id];
      if (isGameInList)
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
    // // Обробка події "connect": перше або повторне підключення після оновлення сторінки
    // const handleConnect = () => {
    //   console.log(`Socket connect event, socket.id: ${socket.id}`);

    //   if (userId) {
    //     console.log(
    //       `Socket connected, registering user ${userId} and joining room`,
    //     );
    //     socket.emit("registerUserId", { userId });
    //     joinToGameRoom(socket, gameId, userId);
    //   } else {
    //     console.log("Socket connected, but user is not logged in");
    //   }
    // };
    // // Обробка події "reconnect": перепідключення після втрати з'єднання (через мережеві проблеми)
    // const handleReconnect = () => {
    //   console.log(`Socket reconnect event, socket.id: ${socket.id}`);
    //   if (userId) {
    //     console.log(
    //       `Socket reconnected, re-registering user ${userId} and joining room`,
    //     );
    //     socket.emit("registerUserId", { userId });
    //     joinToGameRoom(socket, gameId, userId);
    //   } else {
    //     console.log("Socket connected, but user is not logged in");
    //   }
    // };
    // const handleDisconnect = () => {
    //   console.log(
    //     `Socket disconnected, socket.id: ${socket.id || "undefined"}`,
    //   );
    // };

    // const handleError = err => {
    //   console.log(`Socket connect_error: ${err}`);
    //   let errMessage = "";

    //   switch (err.errorMessage) {
    //     case "Error creating game: You already have an active game. Finish or delete it first.":
    //       errMessage = t("player_has_active_game");
    //       break;

    //     default:
    //       errMessage = err.errorMessage;
    //       break;
    //   }

    //   Notify.failure(errMessage);
    // };

    // const handleUpdateUserCredentials = ({ user }) =>
    //   updateUserCredentials(user, dispatch);

    // const handleUserActiveGameIdUpdate = ({ userActiveGameId }) =>
    //   userActiveGameIdUpdate(userActiveGameId, dispatch);

    // const handleGameFirstTurnUpdate = ({ game }) =>
    //   gameFirstTurnUpdate(game, dispatch, userId);

    // // const handlePlayerStartOrJoinToGame = ({ game, player }) =>
    // //   playerStartOrJoinToGame(game, player, dispatch);

    // const handleGameCreated = ({ game }) => {
    //   if (game.hostPlayerId === userId) gameCreated(game, dispatch);
    // };

    // // const handleGameEntry = ({ game, player }) =>
    // //   gameEntry(game, player, dispatch);

    // const handlePlayerJoined = ({ game, player, message }) =>
    //   playerJoined({
    //     game,
    //     player,
    //     message,
    //     userId,
    //     currentGameId: gameId,
    //     navigate,
    //     dispatch,
    //   });

    // const handleUserDeletedFromGame = ({ game, deletedUser }) =>
    //   userDeletedFromGame({
    //     game,
    //     deletedUser,
    //     userId,
    //     dispatch,
    //     navigate,
    //   });

    // const handleGameDeleted = ({ game }) => {
    //   const isGameInList = games[game._id];

    //   if (isGameInList)
    //     gameDeleted(game, dispatch, gameId, userId, navigate, toastId);
    // };

    // const handlePlayersOrderUpdate = ({ game, message }) =>
    //   playersOrderUpdate(game, message, dispatch, activeActions);

    // const handleGameRun = ({ game, message }) => {
    //   gameRun(game, message, dispatch, activeActions, userId);
    // };

    // const handleFirstStorytellerUpdated = ({ game }) => {
    //   firstStorytellerUpdated(game, dispatch, userId);
    // };

    // const handleNextStorytellerUpdated = ({ game }) => {
    //   nextStorytellerUpdated(game, dispatch, userId);
    // };

    // const handlePlayerGuessSuccess = ({ game }) =>
    //   playerGuessSuccess(game, dispatch);

    // const handleVotingStarted = ({ game }) => {
    //   votingStarted(game, dispatch, userId);
    // };

    // const handlePlayerVoteSuccess = ({ game, message }) =>
    //   playerVoteSuccess(game, message, dispatch, activeActions);

    // const handleRoundFinishSuccess = ({ game, message }) =>
    //   roundFinishSuccess(game, message, dispatch, activeActions, userId);

    // const handleStartNewRoundSuccess = ({ game, message }) =>
    //   startNewRoundSuccess(game, message, dispatch, activeActions, userId);

    // // startNewRoundSuccess;

    // const handleGameEnd = ({ game, message }) =>
    //   gameEnd(game, message, dispatch);

    // const handleGameFound = ({ game }) => gameFound(game, dispatch);

    socket.on("disconnect", handleDisconnect);

    socket.on("connect", handleConnect);
    socket.on("reconnect", handleReconnect);
    if (socket.connected) handleConnect(); // якщо сокет уже підключений, то одразу викликати
    socket.on("error", handleError);

    socket.on("updateUserCredentials", handleUpdateUserCredentials);
    socket.on("UserActiveGameId:Update", handleUserActiveGameIdUpdate);

    socket.on("gameFirstTurnUpdated", handleGameFirstTurnUpdate);
    // socket.on("playerStartOrJoinToGame", handlePlayerStartOrJoinToGame);
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
      socket.off("connect", handleConnect);
      socket.off("reconnect", handleReconnect);
      socket.off("error", handleError);

      socket.off("updateUserCredentials", handleUpdateUserCredentials);
      socket.off("UserActiveGameId:Update", handleUserActiveGameIdUpdate);

      socket.off("gameFirstTurnUpdated", handleGameFirstTurnUpdate);
      // socket.off("playerStartOrJoinToGame", handlePlayerStartOrJoinToGame);
      socket.off("gameCreated", handleGameCreated);

      // socket.off("gameEntry", handleGameEntry);
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

      // // if client runout from page (unmount component) before server responding
      // // Очищаємо лише таймери, залишаючи activeActions (на випадок якщо useSetupSocketListeners буде перевикористовуватись у різних компонентах, або при переході між сторінками в рамках одного SPA - тобто монтуватись знову)
      // // Очищення всіх таймерів при розмонтуванні
      // Object.values(activeActions).forEach(action => {
      //   if (action?.meta?.timer) {
      //     clearTimeout(action.meta.timer); // Очищаємо таймер
      //     const key = `${action.payload.eventName}-${action.payload.updatedGame._id}`;
      //     dispatch(clearActiveAction(key)); // Видаляємо дію зі стану Redux
      //   }
      // });
    };
  }, [
    dispatch,
    handleConnect,
    handleDisconnect,
    handleError,
    handleFirstStorytellerUpdated,
    handleGameCreated,
    handleGameDeleted,
    handleGameFirstTurnUpdate,
    handleGameRun,
    handleNextStorytellerUpdated,
    handlePlayerGuessSuccess,
    handlePlayerJoined,
    handlePlayerVoteSuccess,
    handlePlayersOrderUpdate,
    handleReconnect,
    handleRoundFinishSuccess,
    handleStartNewRoundSuccess,
    handleUpdateUserCredentials,
    handleUserActiveGameIdUpdate,
    handleUserDeletedFromGame,
    handleVotingStarted,
  ]);

  // Окремий useEffect для очищення таймерів
  useEffect(() => {
    return () => {
      Object.values(activeActions).forEach(action => {
        if (action?.meta?.timer) {
          clearTimeout(action.meta.timer);
          const key = `${action.payload.eventName}-${action.payload.updatedGame._id}`;
          dispatch(clearActiveAction(key));
        }
      });
    };
  }, [activeActions, dispatch]);
};
