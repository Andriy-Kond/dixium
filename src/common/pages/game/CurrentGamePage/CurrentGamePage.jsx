import { Navigate, useNavigate, useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import CurrentGame from "common/components/game/CurrentGame";
import css from "./CurrentGamePage.module.scss";

import { useDispatch, useSelector } from "react-redux";
import { selectLocalGame, selectUserActiveGameId } from "redux/selectors.js";
import { useEffect } from "react";
import { updateIsRedirecting } from "redux/game/localPersonalSlice.js";

export default function CurrentGamePage() {
  const dispatch = useDispatch();
  const { gameId } = useParams();
  const navigate = useNavigate();
  const userActiveGameId = useSelector(selectUserActiveGameId);
  const currentGame = useSelector(selectLocalGame(gameId));

  // useEffect(() => {
  //   dispatch(updateIsRedirecting(false));
  // }, [dispatch]);

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
