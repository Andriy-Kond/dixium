import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Notify } from "notiflix";

import socket from "socket.js";

import { selectGame } from "app/selectors.js";

import css from "./GameStartedPage.module.scss";

import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";

export default function GameStartedPage() {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();

  const { currentGameId } = useParams();
  const currentGame = useSelector(selectGame(currentGameId));
  const isCurrentGameRunning = currentGame.isGameRunning;

  // useEffect(() => {
  //   const handlePlayerJoined = ({ game, message }) => {
  //     dispatch(updateGame(game)); // update gameSlice state
  //     Notify.success(message); // Notify about new player
  //   };

  //   const handleGameDeleted = data => {
  //     if (data.message) {
  //       Notify.failure(data.message);
  //     } else {
  //       navigate(`/game`, { replace: true });
  //     }
  //   };

  //   const handleNewPlayerUpdated = game => {
  //     clearTimeout(timeoutDnDRef.current);
  //     if (game.message) {
  //       dispatch(updateGame(prevDnDGameStateRef.current));
  //       prevDnDGameStateRef.current = null;
  //       Notify.failure(game.message);
  //     } else {
  //       dispatch(updateGame(game));
  //       prevDnDGameStateRef.current = null;
  //     }
  //   };

  //   const handleGameRunning = game => {
  //     clearTimeout(timeoutRunGameRef.current); // clear timeout because server responded just now

  //     // If there is a message, then it is an error, rollback of the state
  //     if (game.message) {
  //       dispatch(updateGame(prevRunGameStateRef.current));
  //       prevRunGameStateRef.current = null;
  //       Notify.failure(game.message);
  //     } else {
  //       // Server response or response late (more then 5 sec) -> state update
  //       dispatch(updateGame(game));
  //       prevRunGameStateRef.current = null;
  //     }
  //   };

  //   socket.on("playerJoined", handlePlayerJoined);
  //   socket.on("currentGameWasDeleted", handleGameDeleted); // return to gamesList
  //   socket.on("playersOrderUpdated", handleNewPlayerUpdated);
  //   socket.on("currentGame:running", handleGameRunning);

  //   return () => {
  //     socket.off("playerJoined", handlePlayerJoined);
  //     socket.off("currentGameWasDeleted", handleGameDeleted);
  //     socket.off("playersOrderUpdated", handleNewPlayerUpdated);
  //     socket.off("currentGame:running", handleGameRunning);
  //     clearTimeout(timeoutDnDRef.current); // todo перевірити потім чи це правильна реалізація
  //     clearTimeout(timeoutRunGameRef.current); // if client runout from page (unmount component) before server responding
  //   };
  // }, [dispatch, navigate]);

  return (
    <>
      <p>Game Started Page</p>

      <div className={css.container}>
        <div className={css.pageHeader}>
          <p className={css.pageHeader_title}>
            {`Game "${currentGame?.gameName}"`.toUpperCase()}
          </p>
        </div>
        <div className={css.pageMain}>
          {!isCurrentGameRunning && <PrepareGame />}
          {isCurrentGameRunning && <Game />}
        </div>
      </div>
    </>
  );
}
