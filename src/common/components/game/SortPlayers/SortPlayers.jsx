import { useLocation, useNavigate } from "react-router-dom";
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
  setLocationFrom,
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
  const { _id: userId, playerGameId } = userCredentials;
  const currentGame = useSelector(selectLocalGame(userActiveGameId));

  useEffect(() => {
    if (!currentGame) {
      navigate("/game");
      return;
    }
  }, [currentGame, navigate]);

  // const location = useLocation();
  // useEffect(() => {
  //   dispatch(setLocationFrom(location.state?.from));
  //   // console.log(" useEffect >> location.state:::", location);
  // }, [dispatch, location.state?.from]);

  useEffect(() => {
    if (!currentGame) return;
    const { _id: gameId, hostPlayerId } = currentGame;

    const isCurrentPlayerIsHost = hostPlayerId === userId;
    if (isCurrentPlayerIsHost) {
      dispatch(setLocationFrom(`/game/${gameId}/setup/prepare-game`));
    } else {
      dispatch(setLocationFrom(`/game`));
    }
  }, [currentGame, dispatch, userId]);

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(t("players")));
    dispatch(setPageHeaderTextSecond(""));
  }, [dispatch, t]);

  // Оновлює порядок гравців і надсилає зміни через сокети.
  const handleDragEnd = event => {
    if (!currentGame) return;

    const isCurrentPlayerIsHost =
      currentGame.hostPlayerId === userCredentials._id;
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

  const isDisabledSortableContext =
    currentGame?.hostPlayerId !== userCredentials._id ||
    currentGame.isGameRunning;

  return (
    <>
      <div className={css.pageContainer}>
        {/* <h1>Sort Players</h1> */}

        <p className={css.infoText}>{t("req_for_start_game")}</p>

        <div>
          <p className={`${css.infoText} ${css.mgnTop} ${css.mgnBtm}`}>
            {t("players_turn")}
          </p>

          {currentGame && (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={currentGame?.players.map(p => p._id)}
                strategy={verticalListSortingStrategy}
                disabled={isDisabledSortableContext}>
                <ul>
                  {currentGame?.players.map(player => (
                    <SortablePlayer key={player._id} player={player} />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </>
  );
}
