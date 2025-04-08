import { useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./GameStartedPage.module.scss";

import { useDispatch, useSelector } from "react-redux";
import {
  selectGame,
  // selectPageHeaderBgColor,
  // selectPageHeaderText,
  // selectPageHeaderTextColor,
} from "redux/selectors.js";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

import { setPageHeaderText } from "redux/game/localPersonalSlice.js";

export default function GameStartedPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { gameId } = useParams();

  // const pageHeaderText = useSelector(selectPageHeaderText);
  // const pageHeaderBgColor = useSelector(selectPageHeaderBgColor);
  // const pageHeaderTextColor = useSelector(selectPageHeaderTextColor);

  const { isGameRunning, gameName } = useSelector(selectGame(gameId));

  useEffect(() => {
    dispatch(setPageHeaderText(t("game_name", { gameName: gameName })));
  }, [dispatch, gameName, t]);

  return (
    <>
      {/* <div className={css.gameBodyContainer}>
        <div
          className={css.gameHeader}
          style={{
            "--pageHeaderBgColor": pageHeaderBgColor,
            "--pageHeaderTextColor": pageHeaderTextColor,
          }}>
          {pageHeaderText.toUpperCase()}
        </div>
      </div> */}
      <div className={css.container}>
        {!isGameRunning && <PrepareGame />}
        {isGameRunning && <Game />}
      </div>
    </>
  );
}
