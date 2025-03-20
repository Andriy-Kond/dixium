import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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
import { selectGame, selectUserCredentials } from "redux/selectors.js";
import css from "./PrepareGame.module.scss";
import { useOptimisticDispatch } from "hooks/useOptimisticDispatch.js";

import { useEffect, useState } from "react";

export default function PrepareGame() {
  const navigate = useNavigate();

  const { optimisticUpdateDispatch } = useOptimisticDispatch();
  const { gameId } = useParams();
  const currentGame = useSelector(selectGame(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const isCurrentPlayerIsHost =
    currentGame.hostPlayerId === userCredentials._id;
  const isCurrentPlayerInGame = currentGame.players.find(
    p => p._id === userCredentials._id,
  );

  const [isSingleCardModeCheckbox, setIsSingleCardModeCheckbox] =
    useState(false);

  const isDisabledCheckbox =
    !isCurrentPlayerIsHost || currentGame.players.length < 7;

  useEffect(() => {
    if (!isCurrentPlayerInGame) {
      navigate("/game");
    }
  }, [isCurrentPlayerInGame, navigate]);

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
    }; // todo при закінченні гри зробити false

    // optimistic update:
    optimisticUpdateDispatch({
      eventName: "gameRun",
      updatedGame,
    });
  };

  const toGamePage = () => {
    navigate(`/game`);
  };

  return (
    <>
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
          {"Single Card Mode".toUpperCase()}
        </label>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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

      <div className={css.bottomBar}>
        <Button
          onClick={toGamePage}
          btnText={"Back"}
          btnStyle={[["twoBtnsInRow"], ["btnFlexGrow"]]}
        />
        {userCredentials._id === currentGame?.hostPlayerId && (
          <Button
            onClick={runGame}
            btnText={"Run game"}
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
