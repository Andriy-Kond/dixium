import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

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
  setPageHeaderTextSecond,
  showNotification,
  toggleIsSingleCardMode,
} from "redux/game/localPersonalSlice.js";

import clsx from "clsx";
import EditingForm from "../EditingForm/EditingForm.jsx";
import InfoMessage from "common/components/ui/InfoMessage";
import { MdArrowForwardIos } from "react-icons/md";

export default function PrepareGame() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { gameId } = useParams();

  const userActiveGameId = useSelector(selectUserActiveGameId);
  const currentGame = useSelector(selectLocalGame(gameId));

  if (!userActiveGameId || !currentGame) navigate("/game", { replace: true });

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: userId, playerGameId } = userCredentials;

  const isCurrentPlayerIsHost =
    currentGame.hostPlayerId === userCredentials._id;
  useEffect(() => {
    if (!isCurrentPlayerIsHost) {
      navigate(`/game`);
      return;
    }
  }, [isCurrentPlayerIsHost, navigate]);

  //# Page header color and text
  useEffect(() => {
    // dispatch(
    //   setPageHeaderText(t("game_name", { gameName: currentGame.gameName })),
    // );
    dispatch(setPageHeaderText(t("my_game")));
    dispatch(setPageHeaderTextSecond(userCredentials.name));
  }, [currentGame.gameName, dispatch, t, userCredentials.name]);

  const [finishPointsValue, setFinishPointsValue] = useState(
    currentGame.finishPoints,
  );

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

  // const handleFinishPoints = e => {
  //   dispatch(setFinishPoints({ gameId, finishPoints: e.target.value.trim() }));
  // };

  const handleSetFinishPoints = () => {
    if (!finishPointsValue) {
      dispatch(
        showNotification({
          message: t("points_cant_be_empty"),
          type: "error",
        }),
      );
      return;
    }

    if (finishPointsValue < 10) {
      dispatch(
        showNotification({
          message: t("points_must_be_more_then_10"),
          type: "error",
        }),
      );
      return;
    }

    dispatch(
      setFinishPoints({
        gameId,
        finishPoints: finishPointsValue,
      }),
    );

    dispatch(
      showNotification({
        message: t("points_changed"),
        type: "success",
      }),
    );
  };

  const handleClearFinishPoints = () => {
    console.log("handleClearFinishPoints");
    dispatch(setFinishPoints({ gameId, finishPoints: 30 }));
    setFinishPointsValue(30);

    dispatch(
      showNotification({
        message: t("points_reset"),
        type: "success",
      }),
    );
  };
  const isDisableSetPointsBtn =
    !finishPointsValue ||
    finishPointsValue < 10 ||
    finishPointsValue === currentGame.finishPoints;

  const isDisableResetPointsBtn = finishPointsValue === 30;

  const handleSetFinishPointsValue = value => {
    const rawValue = value.replace(/[^0-9]/g, ""); // Фільтрує лише цифри
    const numericValue = rawValue ? parseInt(rawValue, 10) : null; // Якщо inputValue порожній, numericValue буде null, що унеможливлює NaN при відправленні на сервер у emit

    setFinishPointsValue(numericValue);
  };

  return (
    <>
      {/* <h1>Prepare Game</h1> */}
      <div className={css.pageContainer}>
        <div className={css.infoMessageContainer}>
          <InfoMessage />
        </div>

        <p className={css.infoText}>{t("req_for_start_game")}</p>

        <EditingForm
          isDisableSet={isDisableSetPointsBtn}
          isDisableReset={isDisableResetPointsBtn}
          handleClear={handleClearFinishPoints}
          handleSet={handleSetFinishPoints}
          val={finishPointsValue}
          setVal={handleSetFinishPointsValue}
          labelText={t("finish_points")}
          inputMode="numeric"
        />

        <div className={css.checkboxWrapper}>
          <label
            className={clsx(css.checkboxLabel, {
              [css.checked]: currentGame.isSingleCardMode,
              [css.disabled]: isDisabledCheckbox,
            })}>
            <input
              disabled={isDisabledCheckbox}
              className={css.checkboxInput}
              type="checkbox"
              name="isSingleCardMode"
              onChange={() => toggleIsSingleCardMode(gameId)}
              checked={currentGame.isSingleCardMode}
            />
            {t("single_card_mode").toUpperCase()}
          </label>
        </div>

        <p className={css.infoText}>{t("setup_players_turn")}</p>
        <div className={css.listItem}>
          <p className={css.activeText}>{t("players")}</p>
          <button
            className={css.btnLink}
            onClick={() => navigate(`/game/${gameId}/setup/sort-players`)}>
            <span>{`${currentGame.players.length}`}</span>
            <MdArrowForwardIos className={css.btnLinkIcon} />
          </button>
        </div>

        <p className={css.infoText}>{t("select_decks")}</p>
        <div className={css.listItem}>
          <p className={css.activeText}>{t("game_cards")}</p>
          <button
            className={css.btnLink}
            onClick={() => navigate(`/game/${gameId}/setup/select-decks`)}>
            <span>{`${currentGame?.deck?.length}`}</span>
            <MdArrowForwardIos className={css.btnLinkIcon} />
          </button>
        </div>

        <div className={css.copyContainer}>
          <p>ID: {playerGameId}</p>
          <button className={css.btn} onClick={copyToClipboard}>
            {t("copy_to_clipboard")}
          </button>
        </div>
      </div>
    </>
  );
}
