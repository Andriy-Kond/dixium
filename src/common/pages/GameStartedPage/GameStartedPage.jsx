import { useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./GameStartedPage.module.scss";

import { useDispatch, useSelector } from "react-redux";
import { selectGame } from "app/selectors.js";
import { useGetCurrentGameQuery } from "features/game/gameApi.js";
import { useEffect } from "react";
import { updateGame } from "features/game/gameSlice.js";

export default function GameStartedPage() {
  const dispatch = useDispatch();
  const { currentGameId } = useParams();

  // const { data: currentGame, refetch: refetchCurrentGame } =
  //   useGetCurrentGameQuery(currentGameId, { skip: !currentGameId });

  // useEffect(() => {
  //   if (currentGame) {
  //     dispatch(updateGame(currentGame));
  //   }
  // }, [currentGame, dispatch]);

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
