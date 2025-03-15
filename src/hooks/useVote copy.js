import { Notify } from "notiflix";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
  selectCardsOnTable,
  selectGame,
  selectGameDeck,
  selectGameDiscardPile,
  selectGamePlayers,
  selectIsSingleCardMode,
  selectPlayerHand,
  selectUserCredentials,
} from "redux/selectors.js";
import socket from "services/socket.js";
import { refreshDeck } from "utils/game/refreshDeck.js";
import { updatePlayerHandAndTable } from "utils/game/updatePlayerHandAndTable.js";
import { updatePlayers } from "utils/game/updatePlayers.js";

export const useVote = (cardsSet, gameId) => {
  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const gameDeck = useSelector(selectGameDeck(gameId));
  const gameDiscardPile = useSelector(selectGameDiscardPile(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const playerHand = useSelector(selectPlayerHand(gameId, userCredentials._id));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));

  const vote = useCallback(() => {
    const { firstCard, secondCard } = cardsSet;
    if (!firstCard || (!isSingleCardMode && !secondCard)) {
      console.warn("Invalid card selection!");
      Notify.failure("Invalid card selection!");
      return;
    }

    const drawCardsQty = isSingleCardMode ? 1 : 2;
    const movedCards = isSingleCardMode ? [firstCard] : [firstCard, secondCard];

    // Make new arr with selected cards only
    // const movedCards = playerHand.filter(c =>
    //   isSingleCardMode
    //     ? c._id === firstCard._id
    //     : c._id === firstCard._id || c._id === secondCard._id,
    // );

    if (
      // minimal check for exist right data in playerHand
      // !playerHand.some(c => c._id === movedCards[0]._id)
      // full check for exist right data in playerHand
      !movedCards.every(card => playerHand.some(c => c._id === card._id))
    ) {
      console.warn("Not right data in card!");
      Notify.failure("Not right data in card!");
      return;
    }

    const deckRefresh = refreshDeck({
      deck: gameDeck,
      discardPile: gameDiscardPile,
      drawQty: drawCardsQty,
    });

    if (!deckRefresh) {
      console.warn("Error of deckRefresh");
      Notify.failure("Error of deckRefresh");
      return;
    }

    const { updatedDeck, updatedDiscardPile, newCards } = deckRefresh;

    const { updatedPlayerHand, updatedCardsOnTable } = updatePlayerHandAndTable(
      {
        playerHand,
        cardsToMove: movedCards,
        cardsOnTable,
        newCards,
      },
    );

    // // Make new arr without selected cards
    // const updatedPlayerHand = playerHand.filter(c =>
    //   isSingleCardMode
    //     ? c._id !== firstCard._id
    //     : c._id !== firstCard._id && c._id !== secondCard._id,
    // );
    // updatedPlayerHand.push(...newCards);
    // const updatedCardsOnTable = [...cardsOnTable, ...movedCards]; // Add card on table

    // update players
    const updatedPlayers = updatePlayers({
      gamePlayers,
      userId: userCredentials._id,
      updatedHand: updatedPlayerHand,
    });

    const updatedGame = {
      ...currentGame,
      cardsOnTable: updatedCardsOnTable,
      players: updatedPlayers,
      deck: updatedDeck,
      discardPile: updatedDiscardPile,
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
    gameDeck,
    gameDiscardPile,
    gamePlayers,
    isSingleCardMode,
    playerHand,
    userCredentials._id,
  ]);

  return vote;
};
