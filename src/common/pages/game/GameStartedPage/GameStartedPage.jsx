import { useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./GameStartedPage.module.scss";

import { useSelector } from "react-redux";
import { selectLocalGame } from "redux/selectors.js";

export default function GameStartedPage() {
  const { gameId } = useParams();
  // const { isGameRunning } = useSelector(selectGame(gameId));
  const { isGameRunning } = useSelector(selectLocalGame(gameId));

  return (
    <>
      <div className={css.container}>
        {!isGameRunning && <PrepareGame />}
        {isGameRunning && <Game />}
      </div>
    </>
  );
}
