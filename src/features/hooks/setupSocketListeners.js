import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Notify } from "notiflix";
import { clearRef, setRef, updateGame } from "features/game/gameSlice.js";

import socket from "socket.js";

import { selectRefs } from "app/selectors.js";
import {
  PREV_RUN_GAME_STATE,
  TIMEOUT_RUN_GAME,
  PREV_DND_GAME_STATE,
  TIMEOUT_DND,
} from "features/constants/constants.js";

export const useSetupSocketListeners = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refs = useSelector(selectRefs);

  useEffect(() => {
    const handlePlayerJoined = ({ game, message }) => {
      dispatch(updateGame(game)); // update gameSlice state
      Notify.success(message); // Notify about new player
      console.log(" handlePlayerJoined >> message:::", message);
    };

    const handleGameDeleted = data => {
      if (data.message) {
        Notify.failure(data.message);
      } else {
        navigate(`/game`, { replace: true });
      }
    };

    const handleNewPlayerUpdated = game => {
      clearTimeout(refs.TIMEOUT_DND);
      dispatch(clearRef(TIMEOUT_DND));

      if (game.message) {
        dispatch(updateGame(refs.PREV_DND_GAME_STATE));
        dispatch(setRef({ key: PREV_DND_GAME_STATE, value: null }));
        Notify.failure(game.message);
      } else {
        dispatch(updateGame(game));
        dispatch(setRef({ key: PREV_DND_GAME_STATE, value: null }));
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

    socket.on("playerJoined", handlePlayerJoined);
    socket.on("currentGameWasDeleted", handleGameDeleted);
    socket.on("playersOrderUpdated", handleNewPlayerUpdated);
    socket.on("currentGame:running", handleGameRunning);

    return () => {
      socket.off("playerJoined", handlePlayerJoined);
      socket.off("currentGameWasDeleted", handleGameDeleted);
      socket.off("playersOrderUpdated", handleNewPlayerUpdated);
      socket.off("currentGame:running", handleGameRunning);
      clearTimeout(refs.TIMEOUT_DND);
      clearTimeout(refs.TIMEOUT_RUN_GAME); // if client runout from page (unmount component) before server responding
    };
  }, [
    dispatch,
    navigate,
    refs.PREV_DND_GAME_STATE,
    refs.PREV_RUN_GAME_STATE,
    refs.TIMEOUT_DND,
    refs.TIMEOUT_RUN_GAME,
  ]);
};
