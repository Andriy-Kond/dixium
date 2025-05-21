import { useNavigate, useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import CurrentGame from "common/components/game/CurrentGame";
import css from "./CurrentGamePage.module.scss";

import { useSelector } from "react-redux";
import { selectLocalGame, selectUserActiveGameId } from "redux/selectors.js";
import { useEffect } from "react";

export default function CurrentGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const userActiveGameId = useSelector(selectUserActiveGameId);
  const currentGame = useSelector(selectLocalGame(gameId));

  useEffect(() => {
    if (!userActiveGameId || !currentGame) {
      navigate("/game");
      // return <Navigate to="/game" replace />;
      return;
    }
  }, [currentGame, navigate, userActiveGameId]);

  return (
    <>
      <p>Current game page</p>
      <div className={css.container}>
        {currentGame.isGameRunning ? <CurrentGame /> : <PrepareGame />}
        {/* {currentGame.isGameRunning ? (
          <Navigate to={"current-game"} />
        ) : (
          <Navigate to={"prepare-game"} />
        )} */}
      </div>
    </>
  );
}
