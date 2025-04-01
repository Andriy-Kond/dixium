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

  const [color, setColor] = useState(HAND_COLOR);
  const [prevColor, setPrevColor] = useState(HAND_COLOR);
  const [pageName, setPageName] = useState(HAND);
  const [prevPageName, setPrevPageName] = useState(HAND);

  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(null); // "left" or "right"
  const [prevActiveScreen, setPrevActiveScreen] = useState(null);

  const totalScreens = 3; // Кількість сторінок (0, 1, 2)

  useEffect(() => {
    let newColor, newPageName;

    switch (activeScreen) {
      case 0:
        newColor = HAND_COLOR;
        newPageName = HAND;
        break;
      case 1:
        newColor = PLAYERS_COLOR;
        newPageName = PLAYERS;
        break;
      case 2:
        newColor = TABLE_COLOR;
        newPageName = TABLE;
        break;
      default:
        return;
    }

    // Визначення напрямку руху з урахуванням циклічності через % (більш універсальний для будь-якої кількості сторінок)
    if (prevActiveScreen !== null && activeScreen !== prevActiveScreen) {
      const delta =
        (activeScreen - prevActiveScreen + totalScreens) % totalScreens;
      const reverseDelta =
        (prevActiveScreen - activeScreen + totalScreens) % totalScreens;

      // Вибір найкоротшого шляху
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
              {t(prevPageName).toUpperCase()}
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
              {t(pageName).toUpperCase()}
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
