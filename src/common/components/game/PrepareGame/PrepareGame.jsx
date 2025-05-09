import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect } from "react";

import {
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./PrepareGame.module.scss";

import { useTranslation } from "react-i18next";
import {
  setFinishPoints,
  setPageHeaderText,
  showNotification,
  toggleIsSingleCardMode,
} from "redux/game/localPersonalSlice.js";
import InformMessage from "../../ui/InformMessage/InformMessage.jsx";
import clsx from "clsx";
import { useBackButton } from "context/BackButtonContext.jsx";

export default function PrepareGame() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { showBackButton, hideBackButton, backButtonConfig } = useBackButton();
  const { gameId } = useParams();

  const userActiveGameId = useSelector(selectUserActiveGameId);
  const currentGame = useSelector(selectLocalGame(gameId));
  const { isSingleCardMode, finishPoints, hostPlayerId, players } = currentGame;
  if (!userActiveGameId || !currentGame) navigate("/game", { replace: true });

  const handleBackClick = useCallback(() => {
    console.log("handleBackClick PrepareGame");

    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    showBackButton(handleBackClick, "back", 0);

    return () => {
      hideBackButton(0);
    };
  }, [handleBackClick, hideBackButton, showBackButton]);

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: userId, playerGameId } = userCredentials;

  const isCurrentPlayerIsHost = currentGame.hostPlayerId === userId;

  useEffect(() => {
    dispatch(
      setPageHeaderText(t("game_name", { gameName: currentGame.gameName })),
    );
  }, [currentGame.gameName, dispatch, t]);

  const isDisabledCheckbox =
    !isCurrentPlayerIsHost || currentGame.players.length < 7;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(playerGameId.toString()); // копіювання в буфер

      dispatch(
        showNotification({
          message: t("id_copied_to_buffer"),
          type: "success",
        }),
      );
    } catch (err) {
      console.error("Помилка копіювання:", err);
      dispatch(
        showNotification({
          message: t("cant_copy_id_to_buffer"),
          type: "error",
        }),
      );
    }
  };

  const handleFinishPoints = e => {
    dispatch(setFinishPoints({ gameId, finishPoints: e.target.value.trim() }));
  };

  return (
    <>
      <h1>Prepare Game</h1>
      <InformMessage />

      <label>
        <input
          type="number"
          value={finishPoints}
          onChange={handleFinishPoints}
        />
        {t("finish_points")}
      </label>

      <div className={css.checkboxWrapper}>
        <label
          //# для нових браузерів:
          // className={css.checkboxLabel}
          //# для старих браузерів:
          // className={`${css.checkboxLabel} ${
          //   isSingleCardMode ? css.checked : ""
          // } ${isDisabledCheckbox ? css.disabled : ""}`}
          // з використанням clsx
          className={clsx(css.checkboxLabel, {
            [css.checked]: isSingleCardMode,
            [css.disabled]: isDisabledCheckbox,
          })}>
          <input
            disabled={isDisabledCheckbox}
            className={css.checkboxInput}
            type="checkbox"
            name="isSingleCardMode"
            onChange={() => toggleIsSingleCardMode(gameId)}
            checked={isSingleCardMode}
          />
          {t("single_card_mode").toUpperCase()}
        </label>
      </div>

      <div className={css.container}>
        <p>{t("setup_players_turn")}</p>
        <button
          className={css.redirectContainer}
          onClick={() => navigate(`/game/${gameId}/setup/sort-players`)}>
          <span>{t("players")}</span>
          <span>{`${currentGame.players.length} >`}</span>
        </button>

        <p>{t("select_decks")}</p>
        <button
          className={css.redirectContainer}
          onClick={() => navigate(`/game/${gameId}/setup/select-decks`)}>
          <span>{t("game_cards")}</span>
          <span>{`${currentGame?.deck?.length} >`}</span>
        </button>
      </div>

      <p>ID: {playerGameId}</p>
      <button className={css.redirectContainer} onClick={copyToClipboard}>
        {t("copy_to_clipboard")}
      </button>
    </>
  );
}
