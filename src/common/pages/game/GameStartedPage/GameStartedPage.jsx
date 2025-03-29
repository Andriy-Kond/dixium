import { useParams } from "react-router-dom";
import PrepareGame from "common/components/game/PrepareGame";
import Game from "common/components/game/Game";
import css from "./GameStartedPage.module.scss";

import { useSelector } from "react-redux";
import { selectGame } from "redux/selectors.js";
import { useTranslation } from "react-i18next";

export default function GameStartedPage() {
  const { t } = useTranslation();
  const { gameId } = useParams();

  const { isGameRunning, gameName } = useSelector(selectGame(gameId));

  return (
    <>
      {/* <p>Game Started Page</p> */}

      <div className={css.container}>
        <div className={css.pageHeader}>
          <p className={css.pageHeader_title}>
            {/* {`Game "${gameName}"`.toUpperCase()} */}
            {t("game_name", { gameName: gameName.toUpperCase() })}
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
