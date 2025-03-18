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

export const useGuess = (gameId, cardsSet) => {
  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const playerHand = useSelector(selectPlayerHand(gameId, userCredentials._id));
  const playersMoreThanThree = gamePlayers.length > 3;

  const guessStory = useCallback(() => {
    const { firstGuessCardSet, secondGuessCardSet } = cardsSet;
    if (!firstGuessCardSet || (!playersMoreThanThree && !secondGuessCardSet)) {
      console.warn("Invalid card selection!");
      Notify.failure("Invalid card selection!");
      return;
    }

    const movedCards = playersMoreThanThree
      ? // || firstGuessCardSet._id === secondGuessCardSet._id
        [firstGuessCardSet]
      : [firstGuessCardSet, secondGuessCardSet];

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
    playerHand,
    playersMoreThanThree,
    userCredentials._id,
  ]);

  return guessStory;
};
