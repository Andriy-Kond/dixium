import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "notiflix";
import {
  clearRef,
  setCurrentGameId,
  setRef,
  updateGame,
} from "features/game/gameSlice.js";
import socket from "socket.js";
import { selectRefs } from "app/selectors.js";
import {
  PREV_RUN_GAME_STATE,
  TIMEOUT_RUN_GAME,
  PREV_DND_GAME_STATE,
  TIMEOUT_DND,
} from "features/utils/constants.js";
import { useGetAllGamesQuery } from "features/game/gameApi.js";

export const useSetupSocketListeners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refs = useSelector(selectRefs);
  const location = useLocation();

  const match = location.pathname.match(/game\/([\w\d]+)/);
  const currentGameId = match ? match[1] : null;

  const { data: allGames, refetch: refetchAllGames } = useGetAllGamesQuery();

  useEffect(() => {
    // console.log("Setting up socket listeners");
    // if (currentGameId) {
    //   socket.emit("joinGame", currentGameId);
    // }

    const handlePlayerJoined = ({ game, message }) => {
      const { _id } = game;
      dispatch(updateGame(game)); // update gameSlice state
      Notify.success(message); // Notify about new player

      if (currentGameId !== _id) {
        navigate(`/game/${_id}`);
      }
    };

    const handleGameDeleted = ({ game, message }) => {
      const { _id } = game;
      if (message) {
        Notify.failure(message);
      } else {
        refetchAllGames();
        dispatch(setCurrentGameId(null));

        if (currentGameId === _id) {
          navigate(`/game`, { replace: true });
        }
      }
    };

    const handlePlayersOrderUpdated = ({ game, message }) => {
      console.log(" handlePlayersOrderUpdated >> game:::", game);

      clearTimeout(refs.TIMEOUT_DND);
      dispatch(clearRef(TIMEOUT_DND));

      if (message) {
        dispatch(updateGame(refs.PREV_DND_GAME_STATE));
        dispatch(clearRef(PREV_DND_GAME_STATE));
        Notify.failure(message);
      } else {
        dispatch(updateGame(game));
        dispatch(clearRef(PREV_DND_GAME_STATE));
      }
    };

    const handleGetCurrentGame = game => {
      if (game) {
        dispatch(updateGame(game));
      }
    };

    const handleGameRunning = game => {
      clearTimeout(refs.TIMEOUT_RUN_GAME);
      dispatch(clearRef(TIMEOUT_RUN_GAME));

      // If there is a message, then it is an error, rollback of the state
      if (game.message) {
        dispatch(updateGame(refs.PREV_RUN_GAME_STATE));
        dispatch(setRef({ key: PREV_RUN_GAME_STATE, value: null }));
        Notify.failure(game.message);
      } else {
        // Server response or response late (more then 10 sec) -> state update
        dispatch(updateGame(game));
        dispatch(setRef({ key: PREV_RUN_GAME_STATE, value: null }));
      }
    };

    socket.on("playerJoined", handlePlayerJoined); //* checked
    socket.on("currentGameWasDeleted", handleGameDeleted); //* checked

    socket.on("playersOrderUpdated", handlePlayersOrderUpdated);
    socket.on("currentGame:running", handleGameRunning);

    return () => {
      // console.log("Cleaning up socket listeners");
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("currentGameWasDeleted", handleGameDeleted);

      socket.off("playersOrderUpdated", handlePlayersOrderUpdated);
      socket.off("getCurrentGame", handleGetCurrentGame);

      socket.off("currentGame:running", handleGameRunning);
      clearTimeout(refs.TIMEOUT_DND);
      clearTimeout(refs.TIMEOUT_RUN_GAME); // if client runout from page (unmount component) before server responding
    };
  }, [
    currentGameId,
    dispatch,
    navigate,
    refetchAllGames,
    refs.PREV_DND_GAME_STATE,
    refs.PREV_RUN_GAME_STATE,
    refs.TIMEOUT_DND,
    refs.TIMEOUT_RUN_GAME,
  ]);
};
