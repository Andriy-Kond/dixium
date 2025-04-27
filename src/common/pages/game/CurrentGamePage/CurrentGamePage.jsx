import { useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./CurrentGamePage.module.scss";

import { useSelector } from "react-redux";
import { selectLocalGame } from "redux/selectors.js";

export default function CurrentGamePage() {
  const { gameId } = useParams();

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
