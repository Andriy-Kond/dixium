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

export default function GameStartedPage() {
  const { t } = useTranslation();
  const { gameId } = useParams();
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const { isGameRunning, gameName } = useSelector(selectGame(gameId));

  const activeScreen = useSelector(selectActiveScreen(gameId, playerId));
  const [badgeColor, setBadgeColor] = useState(null); // Колір нового бейджа
  const [prevBadgeColor, setPrevBadgeColor] = useState(null); // Колір старого бейджа
  const [pageBadgeName, setPageBadgeName] = useState(null);
  const [prevPageBadgeName, setPrevPageBadgeName] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

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

    // Якщо є попередній бейдж і він відрізняється від нового, запускаємо анімацію
    if (pageBadgeName && pageBadgeName !== newPageName) {
      setPrevPageBadgeName(pageBadgeName);
      setPrevBadgeColor(badgeColor);
      setIsAnimating(true);
    }

    // Встановлюємо нові значення
    setBadgeColor(newColor);
    setPageBadgeName(newPageName);

    // Завершуємо анімацію після її тривалості
    if (isAnimating) {
      const timeout = setTimeout(() => {
        setIsAnimating(false);
        setPrevPageBadgeName(null);
        setPrevBadgeColor(null);
      }, 300); // Тривалість анімації — 0.3s
      return () => clearTimeout(timeout);
    }
  }, [activeScreen, badgeColor, pageBadgeName, isAnimating]);

  return (
    <div className={css.container}>
      <div className={css.pageHeader}>
        <p className={css.pageHeader_title}>
          {t("game_name", { gameName: gameName.toUpperCase() })}
        </p>

        <div className={css.pageBadge}>
          {/* Старий бейдж із ефектом зникнення */}
          {prevPageBadgeName && isAnimating && (
            <span
              className={`${css.pageBadgeName} ${css.fadeOut}`}
              style={{ "--badgeBgColor": prevBadgeColor }}>
              {prevPageBadgeName.toUpperCase()}
            </span>
          )}

          {/* Новий бeyдж із анімацією наїзду */}
          {pageBadgeName && (
            <span
              className={`${css.pageBadgeName} ${
                isAnimating ? css.slideIn : ""
              }`}
              style={{ "--badgeBgColor": badgeColor }}>
              {pageBadgeName.toUpperCase()}
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
