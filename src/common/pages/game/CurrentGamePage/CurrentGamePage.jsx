import { Navigate, useNavigate, useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./CurrentGamePage.module.scss";

import { useSelector } from "react-redux";
import { selectLocalGame, selectUserActiveGameId } from "redux/selectors.js";
import { useBackButton } from "context/BackButtonContext.jsx";
import { useEffect } from "react";

export default function CurrentGamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const userActiveGameId = useSelector(selectUserActiveGameId);

  const { showBackButton, hideBackButton, backButtonConfig } = useBackButton();

  const currentGame = useSelector(selectLocalGame(gameId));

  // useEffect(() => {
  //   // Ховаємо кнопку з пріоритетом 1, щоб перевизначити SharedLayout
  //   console.log("CurrentGamePage >> Ховаю кнопку");
  //   hideBackButton(1);
  //   // Повертаємо кнопку до стану за замовчуванням при розмонтуванні
  //   return () => hideBackButton(0);
  // }, [hideBackButton]);

  if (!userActiveGameId || !currentGame) {
    navigate("/game");
    return <Navigate to="/game" replace />;
  }

  return (
    <>
      <div className={css.container}>
        {currentGame.isGameRunning ? <Game /> : <PrepareGame />}
      </div>
    </>
  );
}
