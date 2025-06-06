import {
  matchPath,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { useTranslation } from "react-i18next";
import { Notify } from "notiflix";

import { selectLocalGame, selectUserCredentials } from "redux/selectors.js";
import { distributeCards } from "utils/game/distributeCards.js";
import { useOptimisticDispatch } from "hooks/useOptimisticDispatch.js";

import css from "./GameSetup.module.scss";

export default function GameSetup() {
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

  return (
    <div className={css.setupOuterContainer}>
      <div className={css.setupInnerContainer}>
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
      <div
        className={css.bgInnerContainer}
        style={{ "--color": isShowStartButton ? "#1c2732" : "#0f171e" }}
      />
    </div>
  );
}
