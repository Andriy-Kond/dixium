import { useDispatch, useSelector } from "react-redux";
import socket from "services/socket.js";
import { GUESSING, LOBBY } from "utils/generals/constants.js";
import {
  selectLocalGame,
  selectSelectedCardId,
  selectUserCredentials,
} from "redux/selectors.js";
import { useCallback } from "react";
import { Notify } from "notiflix";
import { discardHandToTable } from "utils/game/discardHandToTable.js";
import { useTranslation } from "react-i18next";
import { removeSelectedCardId } from "redux/game/localPersonalSlice.js";

export const useTellStory = gameId => {
  // console.log("useTellStory");
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;

  const currentGame = useSelector(selectLocalGame(gameId));
  const { players, storytellerId, cardsOnTable, gameStatus } = currentGame;

  const selectedCardId = useSelector(selectSelectedCardId(gameId, playerId));

  const tellStory = useCallback(() => {
    // console.log("tellStory");

    // Якщо оповідач уже є і це не я, нічого не робимо
    if (storytellerId && storytellerId !== playerId) {
      Notify.info(t("info_someone_else_is_already_the_storyteller"));
      return;
    }

    if (!selectedCardId) {
      // console.log("No card selected!");
      Notify.failure(t("err_no_card_selected"));
      return;
    }

    const currentPlayer = players.find(player => player._id === playerId);
    const movedCard = currentPlayer?.hand.find(c => c._id === selectedCardId);

    if (!movedCard) {
      console.warn("Selected card not found in hand!");
      Notify.failure(t("err_selected_card_not_found_in_hand"));
      return;
    }

    // If storyteller not defined, the player becomes the first storyteller
    const { updatedCardsOnTable, updatedPlayers } = discardHandToTable({
      playerHand: currentPlayer?.hand || [],
      movedCards: [movedCard],
      cardsOnTable: cardsOnTable,
      userId: playerId,
      gamePlayers: players,
      isStoryteller: true,
    });

    const updatedGame = {
      ...currentGame,
      // storytellerId: storytellerId ? storytellerId : playerId,
      storytellerId: playerId,
      gameStatus: GUESSING,
      cardsOnTable: updatedCardsOnTable,
      players: updatedPlayers,
      isFirstTurn: gameStatus === LOBBY ? true : false,
    };

    // setIsSubmitting(true); // Блокуємо повторні натискання

    const event = storytellerId ? "setNextStoryteller" : "setFirstStoryteller";
    // console.log(" tellStory >> event:::", event);

    socket.emit(event, { updatedGame }, response => {
      // setIsSubmitting(false); // Розблокуємо після відповіді
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });

    dispatch(removeSelectedCardId({ gameId, playerId })); // clear selectedCardId
  }, [
    cardsOnTable,
    currentGame,
    dispatch,
    gameId,
    gameStatus,
    playerId,
    players,
    selectedCardId,
    storytellerId,
    t,
  ]);

  return tellStory;
};
