import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import {
  selectFinishPoints,
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./PrepareGame.module.scss";

import { useTranslation } from "react-i18next";
import {
  setFinishPoints,
  setLocationFrom,
  setPageHeaderText,
  setPageHeaderTextSecond,
  showNotification,
  toggleIsSingleCardMode,
} from "redux/game/localPersonalSlice.js";

import clsx from "clsx";
import FormEdit from "../FormEdit";
import { MdArrowForwardIos } from "react-icons/md";
import socket from "services/socket.js";

export default function PrepareGame() {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { gameId } = useParams();

  useEffect(() => {
    dispatch(setLocationFrom("/game"));
  }, [dispatch, location.state?.from]);

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
    dispatch(setPageHeaderText(t("my_game")));
    dispatch(setPageHeaderTextSecond(userCredentials.name));
  }, [currentGame.gameName, dispatch, t, userCredentials.name]);
  const finishPoints = useSelector(selectFinishPoints(gameId));

  const [finishPointsValue, setFinishPointsValue] = useState(
    currentGame?.finishPoints || 30,
  );

  const isDisabledCheckbox =
    !isCurrentPlayerIsHost || currentGame.players.length < 7;

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(playerGameId.toString()); // копіювання в буфер
      } else {
        console.warn("Clipboard API не підтримується у цьому середовищі.");
      }

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

  const handleSetFinishPoints = () => {
    if (!finishPointsValue || finishPointsValue < 10) {
      dispatch(
        showNotification({
          message: t("points_must_be_more_then_10"),
          type: "error",
        }),
      );
      setFinishPointsValue(10);
      dispatch(setFinishPoints({ gameId, finishPoints: 10 }));
      socket.emit("Set_Finish_Points", { gameId, finishPoints: 10 });
      return;
    }

    socket.emit("Set_Finish_Points", {
      gameId,
      finishPoints: finishPointsValue,
    });
  };

  const handleClearFinishPoints = () => {
    // console.log("handleClearFinishPoints");
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
        <p className={css.infoText}>{t("req_for_start_game")}</p>

        <FormEdit
          isDisableSet={isDisableSetPointsBtn}
          isDisableReset={isDisableResetPointsBtn}
          handleClear={handleClearFinishPoints}
          handleSet={handleSetFinishPoints}
          value={finishPointsValue}
          setVal={handleSetFinishPointsValue}
          labelText={t("finish_points")}
          inputMode="numeric"
          initialValue={finishPoints}
          // isLoading={isLoading}
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
            onClick={() =>
              navigate(`/game/${gameId}/setup/sort-players`, {
                state: { from: location },
              })
            }>
            <span>{`${currentGame.players.length}`}</span>
            <MdArrowForwardIos className={css.btnLinkIcon} />
          </button>
        </div>

        <p className={css.infoText}>{t("select_decks")}</p>
        <div className={css.listItem}>
          <p className={css.activeText}>{t("game_cards")}</p>
          <button
            className={css.btnLink}
            onClick={() =>
              navigate(`/game/${gameId}/setup/select-decks`, {
                state: { from: location },
              })
            }>
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
