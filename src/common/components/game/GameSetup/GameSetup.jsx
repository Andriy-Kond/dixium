import { matchPath, Outlet, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Notify } from "notiflix";

import { selectLocalGame, selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button";
import css from "./GameSetup.module.scss";
import { useTranslation } from "react-i18next";
import { distributeCards } from "utils/game/distributeCards.js";
import { useOptimisticDispatch } from "hooks/useOptimisticDispatch.js";

export default function GameSetup() {
  const location = useLocation();
  const { t } = useTranslation();
  const { gameId } = useParams();
  const { optimisticUpdateDispatch } = useOptimisticDispatch();

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: userId, playerGameId } = userCredentials;

  const currentGame = useSelector(selectLocalGame(gameId));
  const { players, deck, isSingleCardMode, finishPoints } = currentGame;

  const isShowStartButton =
    (matchPath(`/game/:gameId/setup/prepare-game`, location.pathname) ||
      matchPath(`/game/:gameId/setup/sort-players`, location.pathname)) &&
    userId === currentGame?.hostPlayerId;

  const handleRunGame = () => {
    const game = distributeCards(currentGame);
    if (game.message) return Notify.failure(game.message); // "Not enough cards in the deck"

    const updatedGame = {
      ...game,
      isGameRunning: true,
      isSingleCardMode,
      finishPoints: Number(finishPoints),
    };

    // optimistic update:
    optimisticUpdateDispatch({
      eventName: "gameRun",
      updatedGame,
    });
  };

  const isCanRunGame =
    players?.length >= 3 &&
    players?.length <= 12 &&
    currentGame?.deck?.length > 0;
  console.log(" GameSetup >> isCanRunGame:::", isCanRunGame);

  return (
    <>
      <p>game setup</p>
      <Outlet />

      {/* {showStartButton && (
        <Button
          btnText={t("run_game")}
          onClick={handleRunGame}
          disabled={!isCanRunGame}
        />
      )} */}

      {isShowStartButton && (
        <Button
          onClick={handleRunGame}
          btnText={t("run_game")}
          btnStyle={["twoBtnsInRow"]}
          disabled={!isCanRunGame}
        />
      )}
    </>
  );
}
