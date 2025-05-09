import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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

export default function SortPlayers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { optimisticUpdateDispatch } = useOptimisticDispatch();
  const userActiveGameId = useSelector(selectUserActiveGameId);
  const currentGame = useSelector(selectLocalGame(userActiveGameId));
  const userCredentials = useSelector(selectUserCredentials);

  const { _id: userId, playerGameId } = userCredentials;
  if (!currentGame) {
    navigate("/game");
    return;
  }

  const isCurrentPlayerIsHost = currentGame.hostPlayerId === userId;
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
      <h1>Sort Players</h1>

      <p>{t("req_for_start_game")}</p>
      <p>{t("players_turn")}</p>

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
    </>
  );
}
