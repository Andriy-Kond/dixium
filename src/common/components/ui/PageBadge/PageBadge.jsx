import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectActiveScreen, selectUserCredentials } from "redux/selectors.js";
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
import css from "./PageBadge.module.scss";

export default function PageBadge() {
  const { t } = useTranslation();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;

  const activeScreen = useSelector(selectActiveScreen(gameId, playerId)); // Number of current active screen
  const [prevActiveScreen, setPrevActiveScreen] = useState(null); // Number of prev active screen

  const [color, setColor] = useState(HAND_COLOR); // Color of next page badge
  const [prevColor, setPrevColor] = useState(HAND_COLOR); // Color of prev page badge
  const [pageName, setPageName] = useState(HAND); // Name of next page badge
  const [prevPageName, setPrevPageName] = useState(HAND); // Name of next page badge

  const [direction, setDirection] = useState(null); // Direction - "left" or "right"
  const [isAnimating, setIsAnimating] = useState(false); // Animation trigger

  const totalScreens = 3; // Total screens (0, 1, 2)

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

    // Визначення напрямку руху з урахуванням циклічності (через % - універсальний, для будь-якої кількості сторінок)
    if (prevActiveScreen !== null && activeScreen !== prevActiveScreen) {
      const delta =
        (activeScreen - prevActiveScreen + totalScreens) % totalScreens;
      const reverseDelta =
        (prevActiveScreen - activeScreen + totalScreens) % totalScreens;

      // Вибір найкоротшого шляху
      const direction = delta <= reverseDelta ? "right" : "left"; // delta — вперед, reverseDelta — назад

      setDirection(direction);
      setPrevPageName(pageName); // now prev page name and current page name are equal
      setPrevColor(color); // now prev page color and current page color are equal
      setIsAnimating(true); // start animation
    }

    // update states
    setColor(newColor);
    setPageName(newPageName);
    setPrevActiveScreen(activeScreen); // now prev active screen and current active screen are equal

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
  );
}
