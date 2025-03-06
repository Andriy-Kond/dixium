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

export default function PrepareGame() {
  const navigate = useNavigate();

  const { optimisticUpdateDispatch } = useOptimisticDispatch();
  const { currentGameId } = useParams();
  const currentGame = useSelector(selectGame(currentGameId));
  const userCredentials = useSelector(selectUserCredentials);

  // Оновлює порядок гравців і надсилає зміни через сокети.
  const handleDragEnd = event => {
    if (currentGame.hostPlayerId !== userCredentials._id) return; // dnd can do the host player only

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

    const updatedGame = { ...game, isGameRunning: true }; // todo при закінченні гри зробити false

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
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={currentGame?.players.map(p => p._id)}
          strategy={verticalListSortingStrategy}
          disabled={currentGame.hostPlayerId !== userCredentials._id}>
          <ul>
            {currentGame?.players.map(player => (
              <SortablePlayer
                key={player._id}
                player={player}
                styles={`${css.item} 
                        ${
                          currentGame.hostPlayerId === userCredentials._id &&
                          css.host
                        }`}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      <div className={css.bottomBar}>
        <Button
          onClick={toGamePage}
          btnText={"Back"}
          btnStyle={["twoBtnsInRow"]}
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
