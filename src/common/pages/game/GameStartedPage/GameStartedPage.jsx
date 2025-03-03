import { useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./GameStartedPage.module.scss";

import { useSelector } from "react-redux";
import { selectGame } from "redux/selectors.js";

export default function GameStartedPage() {
  const { currentGameId } = useParams();

  const { isGameRunning, gameName } = useSelector(selectGame(currentGameId));

  return (
    <>
      <p>Game Started Page</p>

      <div className={css.container}>
        <div className={css.pageHeader}>
          <p className={css.pageHeader_title}>
            {`Game "${gameName}"`.toUpperCase()}
          </p>
        </div>
        <div className={css.pageMain}>
          {!isGameRunning && <PrepareGame />}
          {isGameRunning && <Game />}
        </div>
      </div>
    </>
  );
}
