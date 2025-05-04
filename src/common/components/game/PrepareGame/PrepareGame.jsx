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
  setPageHeaderText,
  showNotification,
} from "redux/game/localPersonalSlice.js";
import InformMessage from "../../ui/InformMessage/InformMessage.jsx";

export default function PrepareGame() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { optimisticUpdateDispatch } = useOptimisticDispatch();
  const { gameId } = useParams();
  const [finishPoints, setFinishPoints] = useState("30");

  const userActiveGameId = useSelector(selectUserActiveGameId);
  const currentGame = useSelector(selectLocalGame(gameId));
  if (!userActiveGameId || !currentGame) navigate("/game", { replace: true });

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: userId, playerGameId } = userCredentials;

  const isCurrentPlayerIsHost = currentGame.hostPlayerId === userId;
  const isCurrentPlayerInGame = currentGame.players.find(p => p._id === userId);

  const [isSingleCardModeCheckbox, setIsSingleCardModeCheckbox] =
    useState(false);

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
      isSingleCardMode: isSingleCardModeCheckbox,
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

  return (
    <>
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
          className={`${css.checkboxLabel} ${
            isSingleCardModeCheckbox ? css.checked : ""
          } ${isDisabledCheckbox ? css.disabled : ""}`}>
          <input
            disabled={isDisabledCheckbox}
            className={css.checkboxInput}
            type="checkbox"
            name="isSingleCardMode"
            onChange={() => setIsSingleCardModeCheckbox(prev => !prev)}
            checked={isSingleCardModeCheckbox}
          />
          {t("single_card_mode").toUpperCase()}
        </label>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
      </DndContext>

      <p>ID: {playerGameId}</p>
      <button className={css.copyBtn} onClick={copyToClipboard}>
        Копіювати в буфер
      </button>

      <div className={css.bottomBar}>
        <Button
          onClick={toGamePage}
          btnText={t("back")}
          btnStyle={[["twoBtnsInRow"], ["btnFlexGrow"]]}
        />
        {userId === currentGame?.hostPlayerId && (
          <Button
            onClick={runGame}
            btnText={t("run_game")}
            btnStyle={["twoBtnsInRow"]}
            disabled={
              currentGame.players.length < 3 || currentGame.players.length > 12
            }
          />
        )}
      </div>
    </>
  );
}
