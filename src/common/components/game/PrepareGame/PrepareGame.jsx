import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Notify } from "notiflix";

import SortablePlayer from "common/components/game/SortablePlayer";
import { distributeCards } from "utils/game/distributeCards.js";
import Button from "common/components/ui/Button/index.js";
import {
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import css from "./PrepareGame.module.scss";
import { useOptimisticDispatch } from "hooks/useOptimisticDispatch.js";
import { useTranslation } from "react-i18next";
import {
  setFinishPoints,
  setPageHeaderText,
  showNotification,
  toggleIsSingleCardMode,
} from "redux/game/localPersonalSlice.js";
import InformMessage from "../../ui/InformMessage/InformMessage.jsx";
import clsx from "clsx";

export default function PrepareGame() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { optimisticUpdateDispatch } = useOptimisticDispatch();
  const { gameId } = useParams();
  // const [finishPoints, setFinishPoints] = useState("30");

  const userActiveGameId = useSelector(selectUserActiveGameId);
  const currentGame = useSelector(selectLocalGame(gameId));
  const { isSingleCardMode, finishPoints, hostPlayerId, players } = currentGame;
  if (!userActiveGameId || !currentGame) navigate("/game", { replace: true });

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: userId, playerGameId } = userCredentials;

  const isCurrentPlayerIsHost = currentGame.hostPlayerId === userId;
  const isCurrentPlayerInGame = currentGame.players.find(p => p._id === userId);

  useEffect(() => {
    dispatch(
      setPageHeaderText(t("game_name", { gameName: currentGame.gameName })),
    );
  }, [currentGame.gameName, dispatch, t]);

  const isDisabledCheckbox =
    !isCurrentPlayerIsHost || currentGame.players.length < 7;

  // Оновлює порядок гравців і надсилає зміни через сокети.
  const handleDragEnd = event => {
    if (!isCurrentPlayerIsHost) return; // dnd can do the host player only

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = currentGame.players.findIndex(p => p._id === active.id);
    const newIndex = currentGame.players.findIndex(p => p._id === over.id);
    const newPlayersOrder = arrayMove(currentGame.players, oldIndex, newIndex);
    const updatedGame = { ...currentGame, players: newPlayersOrder };

    // optimistic update:
    optimisticUpdateDispatch({
      eventName: "newPlayersOrder",
      updatedGame,
    });
  };

  const runGame = () => {
    const game = distributeCards(currentGame);
    if (game.message) return Notify.failure(game.message); // "Not enough cards in the deck"

    const updatedGame = {
      ...game,
      isGameRunning: true,
      isSingleCardMode,
      finishPoints: Number(finishPoints),
    };

    // optimistic update:
    optimisticUpdateDispatch({
      eventName: "gameRun",
      updatedGame,
    });
  };

  const toGamePage = () => {
    navigate(`/game`);
  };

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

  // const isCanRunGame =
  //   currentGame.players.length < 3 ||
  //   currentGame.players.length > 12 ||
  //   gameDeck.length > 0;

  return (
    <>
      <h1>Prepare Game</h1>
      <InformMessage />

      <label>
        <input
          type="number"
          value={finishPoints}
          onChange={e => setFinishPoints(e.target.value.trim())}
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
      {/* <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={currentGame?.players.map(p => p._id)}
          strategy={verticalListSortingStrategy}
          disabled={currentGame.hostPlayerId !== userId}>
          <ul className={css.playersList}>
            {currentGame?.players.map(player => (
              <SortablePlayer key={player._id} player={player} />
            ))}
          </ul>
        </SortableContext>
      </DndContext> */}

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

      <div className={css.bottomBar}>
        <Button
          onClick={toGamePage}
          btnText={t("back")}
          btnStyle={[["twoBtnsInRow"], ["btnFlexGrow"]]}
        />

        {/* {userId === currentGame?.hostPlayerId && (
          <Button
            onClick={runGame}
            btnText={t("run_game")}
            btnStyle={["twoBtnsInRow"]}
            disabled={!isCanRunGame}
          />
        )} */}
      </div>
    </>
  );
}
