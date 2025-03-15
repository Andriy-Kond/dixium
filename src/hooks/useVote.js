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

export const useVote = (cardsSet, currentGameId) => {
  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectGame(currentGameId));
  const gamePlayers = useSelector(selectGamePlayers(currentGameId));
  const cardsOnTable = useSelector(selectCardsOnTable(currentGameId));
  const playerHand = useSelector(
    selectPlayerHand(currentGameId, userCredentials._id),
  );
  const isSingleCardMode = useSelector(selectIsSingleCardMode(currentGameId));

  const vote = useCallback(() => {
    const { firstCard, secondCard } = cardsSet;
    if (!firstCard || (!isSingleCardMode && !secondCard)) {
      console.warn("Invalid card selection!");
      Notify.failure("Invalid card selection!");
      return;
    }

    const movedCards = isSingleCardMode ? [firstCard] : [firstCard, secondCard];

    if (!movedCards.every(card => playerHand.some(c => c._id === card._id))) {
      console.warn("Not right data in card!");
      Notify.failure("Not right data in card!");
      return;
    }

    // Скидання карт з руки на стіл
    const updatedPlayerHand = playerHand.filter(
      card => !movedCards.some(c => c._id === card._id),
    );
    const updatedCardsOnTable = [...cardsOnTable, ...movedCards];

    // Перезапис руки плеера і мітка, що він походив
    const updatedPlayers = gamePlayers.map(player =>
      player._id === userCredentials._id
        ? { ...player, hand: updatedPlayerHand, isVoted: true }
        : player,
    );

    const updatedGame = {
      ...currentGame,
      cardsOnTable: updatedCardsOnTable,
      players: updatedPlayers,
      isVoted: true, // todo скинути перед наступним раундом
    };

    socket.emit("playerVoting", { updatedGame }, response => {
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

  return vote;
};
