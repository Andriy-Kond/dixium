import { useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./GameStartedPage.module.scss";

import { useSelector } from "react-redux";
import {
  selectActiveScreen,
  selectGame,
  selectUserCredentials,
} from "redux/selectors.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  HAND,
  HAND_COLOR,
  PLAYERS,
  PLAYERS_COLOR,
  TABLE,
  TABLE_COLOR,
} from "utils/generals/constants.js";

export default function GameStartedPage() {
  const { t } = useTranslation();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;

  const { isGameRunning, gameName } = useSelector(selectGame(gameId));
  const activeScreen = useSelector(selectActiveScreen(gameId, playerId));

  const [color, setColor] = useState(null);
  const [prevColor, setPrevColor] = useState(null);
  const [pageName, setPageName] = useState(null);
  const [prevPageName, setPrevPageName] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(null); // "left" або "right"
  const [prevActiveScreen, setPrevActiveScreen] = useState(null);

  const totalScreens = 3; // Кількість сторінок (0, 1, 2)

  useEffect(() => {
    let newColor, newPageName;

    switch (activeScreen) {
      case 0:
        newColor = "#00ca22";
        newPageName = "Home";
        break;
      case 1:
        newColor = "#2294ff";
        newPageName = "Players";
        break;
      case 2:
        newColor = "#ff2f2f";
        newPageName = "Table";
        break;
      default:
        return;
    }

    // Визначаємо напрямок руху з урахуванням циклічності через %
    if (prevActiveScreen !== null && activeScreen !== prevActiveScreen) {
      const delta =
        (activeScreen - prevActiveScreen + totalScreens) % totalScreens;
      const reverseDelta =
        (prevActiveScreen - activeScreen + totalScreens) % totalScreens;

      // Вибираємо найкоротший шлях
      const direction = delta <= reverseDelta ? "right" : "left"; // delta — вперед, reverseDelta — назад

      setDirection(direction);
      setPrevPageName(pageName);
      setPrevColor(color);
      setIsAnimating(true);
    }

    // Оновлюємо стан
    setColor(newColor);
    setPageName(newPageName);
    setPrevActiveScreen(activeScreen);

    // Завершуємо анімацію
    if (isAnimating) {
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setPrevPageName(null);
        setPrevColor(null);
        setDirection(null);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [activeScreen, color, pageName, isAnimating, prevActiveScreen]);

  return (
    <div className={css.container}>
      <div className={css.pageHeader}>
        <p className={css.pageHeader_title}>
          {t("game_name", { gameName: gameName.toUpperCase() })}
        </p>
        <div className={css.pageBadge}>
          {prevPageName && isAnimating && (
            <span
              className={`${css.pageName} ${css.fadeOut}`}
              style={{ "--badgeBgColor": prevColor }}>
              {prevPageName}
            </span>
          )}
          {pageName && (
            <span
              className={`${css.pageName} ${
                isAnimating
                  ? direction === "right"
                    ? css.slideInRight
                    : css.slideInLeft
                  : ""
              }`}
              style={{ "--badgeBgColor": color }}>
              {pageName}
            </span>
          )}
        </div>
      </div>
      <div className={css.pageMain}>
        {!isGameRunning && <PrepareGame />}
        {isGameRunning && <Game />}
      </div>
    </div>
  );
}
