import { Notify } from "notiflix";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
  selectCardsOnTable,
  selectGame,
  selectGamePlayers,
  selectIsSingleCardMode,
  selectPlayerHand,
  selectUserCredentials,
} from "redux/selectors.js";
import socket from "services/socket.js";
import { discardHandToTable } from "utils/game/discardHandToTable.js";

export const useGuess = (cardsSet, gameId) => {
  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const playerHand = useSelector(selectPlayerHand(gameId, userCredentials._id));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));

  const guessStory = useCallback(() => {
    const { firstCard, secondCard } = cardsSet;
    if (!firstCard || (!isSingleCardMode && !secondCard)) {
      console.warn("Invalid card selection!");
      Notify.failure("Invalid card selection!");
      return;
    }

    const movedCards =
      isSingleCardMode || firstCard._id === secondCard._id
        ? [firstCard]
        : [firstCard, secondCard];

    if (!movedCards.every(card => playerHand.some(c => c._id === card._id))) {
      console.warn("Not right data in card!");
      Notify.failure("Not right data in card!");
      return;
    }

    const { updatedCardsOnTable, updatedPlayers } = discardHandToTable({
      playerHand,
      movedCards,
      cardsOnTable,
      userId: userCredentials._id,
      gamePlayers,
    });

    const updatedGame = {
      ...currentGame,
      cardsOnTable: updatedCardsOnTable,
      players: updatedPlayers,
    };

    socket.emit("playerGuessing", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game:", response.error);
      }
    });
  }, [
    cardsOnTable,
    cardsSet,
    currentGame,
    gamePlayers,
    isSingleCardMode,
    playerHand,
    userCredentials._id,
  ]);

  return guessStory;
};
