import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "notiflix";
import { clearActiveAction, updateGame } from "redux/game/gameSlice.js";
import socket from "servises/socket.js";
import { selectActiveActions, selectUserCredentials } from "redux/selectors.js";

import { gameApi, useGetAllGamesQuery } from "redux/game/gameApi.js";
import { gameDelete, gameRunning, playersOrderUpdated } from "./handlers";

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

    // todo: об'єднати створення нової гри і оновлення гри!
    const handleNewGame = newGame => {
      dispatch(
        gameApi.util.updateQueryData("getAllGames", undefined, draft => {
          const index = draft.findIndex(g => g._id === newGame._id);
          if (index !== -1) {
            draft[index] = newGame; // Оновлюємо гру, якщо вона вже існує
          } else {
            draft.push(newGame); // Додаємо нову гру, якщо її ще немає
          }
        }),
      );
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

    const handlePlayerJoined = ({ game, player, message }) => {
      message && Notify.success(message); // Notify about new player

      if (player._id === userCredentials._id && currentGameId !== game._id) {
        navigate(`/game/${game._id}`);
      }
    };

    const handleGetCurrentGame = game => {
      if (game) {
        dispatch(updateGame(game));
      }
    };

    const handleGameDeleted = ({ game, message }) =>
      gameDelete(game, message, dispatch, currentGameId, navigate); //* OK

    const handlePlayersOrderUpdated = ({ game, message }) =>
      playersOrderUpdated(game, message, dispatch, activeActions); //* OK

    const handleGameRunning = ({ game, message }) =>
      gameRunning(game, message, dispatch, activeActions); //* OK

    // For reconnect group
    joinGameRoom(); // Handle in initial connection
    socket.on("connect", handleConnect);
    socket.on("reconnect", handleReconnect);
    socket.on("error", handleError);

    socket.on("newGameCreated", handleNewGame);
    socket.on("updateGame", handleUpdateGame);

    socket.on("playerJoined", handlePlayerJoined);
    socket.on("currentGameWasDeleted", handleGameDeleted); //* OK

    // socket.on("playersOrderUpdated", handlePlayersOrderUpdated);
    socket.on("playersOrderUpdated", handlePlayersOrderUpdated); //* OK
    socket.on("currentGame:running", handleGameRunning); //* OK

    return () => {
      // console.log("Cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("reconnect", handleReconnect);
      socket.off("error", handleError);

      socket.off("newGameCreated", handleNewGame);
      socket.off("updateGame", handleUpdateGame);

      socket.off("playerJoined", handlePlayerJoined);
      socket.off("currentGameWasDeleted", handleGameDeleted); //* OK

      socket.off("playersOrderUpdated", handlePlayersOrderUpdated); //* OK
      socket.off("currentGame:running", handleGameRunning); //* OK

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
