import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { useOptimisticDispatch } from "hooks/useOptimisticDispatch.js";
import {
  selectLocalGame,
  selectUserActiveGameId,
  selectUserCredentials,
} from "redux/selectors.js";
import SortablePlayer from "common/components/game/SortablePlayer";
import css from "./SortPlayers.module.scss";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import {
  setPageHeaderText,
  setPageHeaderTextSecond,
} from "redux/game/localPersonalSlice.js";

export default function SortPlayers() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { optimisticUpdateDispatch } = useOptimisticDispatch();

  const userActiveGameId = useSelector(selectUserActiveGameId);
  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectLocalGame(userActiveGameId));

  useEffect(() => {
    if (!currentGame) {
      navigate("/game");
      return;
    }
  }, [currentGame, navigate]);

  //# Page header color and text
  useEffect(() => {
    const headerTitleText = t("players");
    dispatch(setPageHeaderText(headerTitleText));
    dispatch(setPageHeaderTextSecond(""));
  }, [dispatch, t]);

  const isCurrentPlayerIsHost =
    currentGame.hostPlayerId === userCredentials._id;
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

  return (
    <>
      <div className={css.pageContainer}>
        {/* <h1>Sort Players</h1> */}

        <p className={css.infoText}>{t("req_for_start_game")}</p>

        <div>
          <p className={`${css.infoText} ${css.mgnTop} ${css.mgnBtm}`}>
            {t("players_turn")}
          </p>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}>
            <SortableContext
              items={currentGame?.players.map(p => p._id)}
              strategy={verticalListSortingStrategy}
              disabled={currentGame.hostPlayerId !== userCredentials._id}>
              <ul>
                {currentGame?.players.map(player => (
                  <SortablePlayer key={player._id} player={player} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </>
  );
}
