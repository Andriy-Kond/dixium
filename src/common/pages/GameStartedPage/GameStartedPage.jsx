import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectGame } from "app/selectors.js";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./GameStartedPage.module.scss";

export default function GameStartedPage() {
  const { currentGameId } = useParams();
  const currentGame = useSelector(selectGame(currentGameId));
  const isCurrentGameRunning = currentGame.isGameRunning;

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
