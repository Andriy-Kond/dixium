import {
  matchPath,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Notify } from "notiflix";
import { useTranslation } from "react-i18next";

import {
  selectComponentHeight,
  selectLocalGame,
  selectUserCredentials,
} from "redux/selectors.js";
import { distributeCards } from "utils/game/distributeCards.js";
import { useOptimisticDispatch } from "hooks/useOptimisticDispatch.js";
import css from "./GameSetup.module.scss";
import { useEffect, useRef } from "react";
import InfoMessage from "common/components/ui/InfoMessage/InfoMessage.jsx";

import { useComponentHeight } from "hooks/socketHandlers/useComponentHeight.js";

export default function GameSetup() {
  useEffect(() => {
    console.log("render GameSetup");
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameId } = useParams();
  const { optimisticUpdateDispatch } = useOptimisticDispatch();

  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectLocalGame(gameId));
  useEffect(() => {
    if (!currentGame) {
      navigate("/game");
      return;
    }
  }, [currentGame, navigate]);

  //# Визначення висоти компонента
  const componentRef = useRef(null);
  useComponentHeight(componentRef);
  // const componentRef = useRef(null);
  // useComponentHeight(componentRef.current);
  // const componentHeight = useSelector(selectComponentHeight);
  // useEffect(() => {
  // }, [componentHeight]);
  // console.log(" GameSetup >> componentHeight:::", componentHeight);

  const handleRunGame = () => {
    if (!currentGame) return;
    const { isSingleCardMode, finishPoints } = currentGame;

    const game = distributeCards(currentGame);
    if (game.message) return Notify.failure(game.message); // "Not enough cards in the deck"

    const updatedGame = {
      ...game,
      isGameRunning: true,
      isSingleCardMode,
      finishPoints: Number(finishPoints),
      currentRoundNumber: 1,
    };

    // optimistic update:
    optimisticUpdateDispatch({
      eventName: "Game_Run",
      updatedGame,
    });
  };

  if (!currentGame) return <>Error: no current game!</>;

  const { players, deck, finishPoints, hostPlayerId } = currentGame;
  const isCanRunGame =
    players?.length >= 3 &&
    players?.length <= 12 &&
    deck?.length >= 84 &&
    finishPoints >= 10;

  const isShowStartButton =
    (matchPath(`/game/:gameId/setup/prepare-game`, location.pathname) ||
      matchPath(`/game/:gameId/setup/sort-players`, location.pathname)) &&
    userCredentials._id === hostPlayerId;

  // Відображення лоадера, якщо висота ще не готова
  // if (!isHeightReady) {
  //   return (
  //     <div className={css.suspenseLoaderContainer}>
  //       <span className={css.loader} />
  //     </div>
  //   );
  // }

  return (
    <div className={css.setupOuterContainer} ref={componentRef}>
      {/* <p>game setup</p> */}
      <div className={css.setupInnerContainer}>
        <div className={css.infoMessageContainer}>
          <InfoMessage />
        </div>

        <Outlet />
        {isShowStartButton && (
          <div className={css.startBtnContainer}>
            <button
              className={css.btnStart}
              onClick={handleRunGame}
              disabled={!isCanRunGame}>
              {t("start_game")}
            </button>
          </div>
        )}
      </div>
      <div className={css.bgInnerContainer} />
    </div>
  );
}
