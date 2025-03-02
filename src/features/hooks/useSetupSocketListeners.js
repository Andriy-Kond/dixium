import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "notiflix";
import {
  clearActiveAction,
  setCurrentGameId,
  updateGame,
} from "features/game/gameSlice.js";
import socket from "socket.js";
import { selectActiveActions, selectUserCredentials } from "app/selectors.js";

import { gameApi, useGetAllGamesQuery } from "features/game/gameApi.js";

export const useSetupSocketListeners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userCredentials = useSelector(selectUserCredentials);
  const location = useLocation();
  const match = location.pathname.match(/game\/([\w\d]+)/);
  const currentGameId = match ? match[1] : null;
  const activeActions = useSelector(selectActiveActions);

  const {
    data: allGames,
    refetch: refetchAllGames,
    currentData,
    error,
    isUninitialized,
    isLoading,
    isFetching,
    isSuccess,
    isError,
  } = useGetAllGamesQuery();
  // data - The latest returned result regardless of hook arg, if present.
  // currentData - The latest returned result for the current hook arg, if present.
  // error - The error result if present.
  // isUninitialized - When true, indicates that the query has not started yet.
  // isLoading - When true, indicates that the query is currently loading for the first time, and has no data yet. This will be true for the first request fired off, but not for subsequent requests.
  // isFetching - When true, indicates that the query is currently fetching, but might have data from an earlier request. This will be true for both the first request fired off, as well as subsequent requests.
  // isSuccess - When true, indicates that the query has data from a successful request.
  // isError - When true, indicates that the query is in an error state.
  // refetch - A function to force refetch the query

  // const { currentGameId } = useParams();
  // const { data: currentGame, refetch: refetchCurrentGame } =
  //   useGetCurrentGameQuery(currentGameId, { skip: !currentGameId });
  // useEffect(() => {
  //   if (currentGame) {
  //     dispatch(updateGame(currentGame));
  //   }
  // }, [currentGame, dispatch]);

  // const [
  //   updateCurrentGame,
  //   { isLoading, isUninitialized, data, error, isError, isSuccess, reset },
  // ] = useUpdateCurrentGameMutation();

  useEffect(() => {
    const joinGameRoom = () => {
      if (socket.connected && currentGameId && userCredentials._id) {
        socket.emit("joinGameRoom", {
          gameId: currentGameId,
          player: userCredentials,
        });
      }
    };

    const handleConnect = () => {
      // Обробка події "connect" // Обробка підключення (перше або повторне) - після оновлення сторінки

      joinGameRoom();
    };

    const handleReconnect = () => {
      // Обробка події "reconnect" // Обробка перепідключення після втрати з'єднання (наприклад, через мережеві проблеми)
      joinGameRoom();
    };

    const handleError = err => Notify.failure(err.message);

    const handleNewGame = () => {
      refetchAllGames();
    };

    const handleUpdateGame = game => {
      if (game) {
        dispatch(updateGame(game));

        // update Redux state:
        // refetchAllGames(); // призводить до оновлення всієї сторінки
        // or handle change of gameApi without refetchAllGames():
        dispatch(
          gameApi.util.updateQueryData("getAllGames", undefined, draft => {
            const index = draft.findIndex(g => g._id === game._id);
            if (index !== -1) {
              draft[index] = game; // Оновлюємо конкретну гру
            }
          }),
        );
      }
    };

    const handlePlayerJoined = ({ game, message }) => {
      // dispatch(updateGame(game)); // update gameSlice state
      message && Notify.success(message); // Notify about new player

      if (currentGameId !== game._id) {
        navigate(`/game/${game._id}`);
      }
    };

    const handleGameDeleted = ({ game, message }) => {
      const { _id } = game;
      if (message) {
        Notify.failure(message);
      } else {
        refetchAllGames();
        dispatch(setCurrentGameId(null));
        dispatch(clearActiveAction({}));

        if (currentGameId === _id) {
          navigate(`/game`, { replace: true });
        }
      }
    };

    const handleGetCurrentGame = game => {
      if (game) {
        dispatch(updateGame(game));
      }
    };

    const handlePlayersOrderUpdated = ({ game, message }) => {
      const relatedAction = Object.values(activeActions).find(
        action => action.payload.updatedGame._id === game._id,
      );

      if (relatedAction) {
        // Логіка для ініціатора
        const { eventName } = relatedAction.payload;
        const key = `${eventName}-${game._id}`;
        if (message) {
          dispatch(updateGame(relatedAction.meta.previousGameState));
          Notify.failure(message);
        } else {
          dispatch(updateGame(game));
        }
        if (relatedAction?.meta?.timer) {
          clearTimeout(relatedAction.meta.timer);
          dispatch(clearActiveAction(key));
        }
      } else {
        // Логіка для інших гравців
        if (message) {
          Notify.failure(message);
        } else {
          dispatch(updateGame(game));
        }
      }
    };

    const handleGameRunning = ({ game, message }) => {
      const relatedAction = Object.values(activeActions).find(
        action => action.payload.updatedGame._id === game._id,
      );

      if (relatedAction) {
        // Логіка для ініціатора
        const { eventName } = relatedAction.payload;
        const key = `${eventName}-${game._id}`;

        // If there is a message, then it is an error, rollback of the state
        if (message) {
          dispatch(updateGame(relatedAction.meta.previousGameState));
          Notify.failure(message);
        } else {
          // Server response or response late (more then 10 sec) -> state update
          dispatch(updateGame(game));
        }

        if (relatedAction?.meta?.timer) {
          clearTimeout(relatedAction.meta.timer);
          dispatch(clearActiveAction(key));
        }
      } else {
        // Логіка для інших гравців
        if (message) {
          Notify.failure(message);
        } else {
          dispatch(updateGame(game));
        }
      }
    };

    // For reconnect group
    joinGameRoom(); // Handle in initial connection
    socket.on("connect", handleConnect);
    socket.on("reconnect", handleReconnect);
    socket.on("error", handleError);

    socket.on("newGameCreated", handleNewGame);
    socket.on("updateGame", handleUpdateGame);

    socket.on("playerJoined", handlePlayerJoined); //* checked
    socket.on("currentGameWasDeleted", handleGameDeleted); //* checked

    socket.on("playersOrderUpdated", handlePlayersOrderUpdated);
    socket.on("currentGame:running", handleGameRunning);

    return () => {
      // console.log("Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("reconnect", handleReconnect);
      socket.off("error", handleError);

      socket.off("newGameCreated", handleNewGame);
      socket.off("updateGame", handleUpdateGame);

      socket.off("playerJoined", handlePlayerJoined);
      socket.off("currentGameWasDeleted", handleGameDeleted);

      socket.off("playersOrderUpdated", handlePlayersOrderUpdated);
      socket.off("currentGame:running", handleGameRunning);

      socket.off("getCurrentGame", handleGetCurrentGame);

      // if client runout from page (unmount component) before server responding
      // setActiveActions({}); // очистити все
      // Очищаємо лише таймери, залишаючи activeActions (на випадок якщо useSetupSocketListeners буде перевикористовуватись у різних компонентах, або при переході між сторінками в рамках одного SPA - тобто монтуватись знову)

      // Очищення таймерів при розмонтуванні
      // Object.values(activeActions).forEach(action => {
      //   if (action?.meta?.timer) {
      //     clearTimeout(action.meta.timer); // Очищаємо таймер

      //     // Оновлюємо action.meta, щоб видалити timer
      //     setActiveActions(prev => ({
      //       ...prev,
      //       [`${action.payload.eventName}-${action.payload.updatedGame._id}`]: {
      //         ...action,
      //         meta: { ...action.meta, timer: null },
      //       },
      //     }));
      //   }
      // });

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
