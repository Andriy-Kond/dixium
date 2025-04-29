import { Navigate, useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./CurrentGamePage.module.scss";

import { useSelector } from "react-redux";
import { selectLocalGame } from "redux/selectors.js";

export default function CurrentGamePage() {
  const { gameId } = useParams();

  const currentGame = useSelector(selectLocalGame(gameId));

  if (!currentGame) {
    // return null; // Або можна додати <Navigate to="/game" replace />
    return <Navigate to="/game" replace />;
  }

  return (
    <>
      <div className={css.container}>
        {currentGame.isGameRunning ? <Game /> : <PrepareGame />}
      </div>
    </>
  );
}
