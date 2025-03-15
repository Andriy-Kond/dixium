import { useSelector } from "react-redux";
import socket from "services/socket.js";
import { VOTING } from "utils/generals/constants.js";
import {
  selectCardsOnTable,
  selectGame,
  selectGameDeck,
  selectGameDiscardPile,
  selectGamePlayers,
  selectPlayerHand,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import { refreshDeck } from "utils/game/refreshDeck.js";
import { updatePlayerHandAndTable } from "utils/game/updatePlayerHandAndTable.js";
import { updatePlayers } from "utils/game/updatePlayers.js";
import { useCallback } from "react";

export const useTellStory = (gameId, selectedCardId, setSelectedCardId) => {
  const currentGame = useSelector(selectGame(gameId));
  const gameDeck = useSelector(selectGameDeck(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const playerHand = useSelector(selectPlayerHand(gameId, userCredentials._id));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const gameDiscardPile = useSelector(selectGameDiscardPile(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));

  const tellStory = useCallback(() => {
    if (!selectedCardId) {
      console.warn("No card selected!");
      return;
    }

    const movedCard = playerHand.find(c => c._id === selectedCardId);
    if (!movedCard) {
      console.warn("Selected card not found in hand!");
      return;
    }

    const drawQty = 1;
    // If storyteller not defined, the player becomes the first storyteller
    if (!storytellerId) {
      const deckRefresh = refreshDeck({
        deck: gameDeck,
        discardPile: gameDiscardPile,
        drawQty,
      });
      if (!deckRefresh) return;

      const { updatedDeck, updatedDiscardPile, newCards } = deckRefresh;

      const { updatedPlayerHand, updatedCardsOnTable } =
        updatePlayerHandAndTable({
          playerHand,
          cardsToMove: [movedCard],
          cardsOnTable,
          newCards,
        });
      // const updatedPlayerHand = playerHand.filter(c => c._id !== selectedCardId);
      // updatedPlayerHand.push(newCards);
      // const updatedCardsOnTable = [...cardsOnTable, movedCard];

      const updatedPlayers = updatePlayers({
        gamePlayers,
        userId: userCredentials._id,
        updatedHand: updatedPlayerHand,
      });

      const updatedGame = {
        ...currentGame,
        storytellerId: userCredentials._id,
        gameStatus: VOTING,
        cardsOnTable: updatedCardsOnTable,
        players: updatedPlayers,
        deck: updatedDeck,
        discardPile: updatedDiscardPile,
        isFirstTurn: true,
      };

      socket.emit("setFirstStoryteller", { updatedGame }, response => {
        if (response?.error) {
          console.error("Failed to update game:", response.error);
        }
      });

      setSelectedCardId(null); // clear
    }
  }, [
    cardsOnTable,
    currentGame,
    gameDeck,
    gameDiscardPile,
    gamePlayers,
    playerHand,
    selectedCardId,
    setSelectedCardId,
    storytellerId,
    userCredentials._id,
  ]);

  return tellStory;
};
