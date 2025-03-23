import { useSelector } from "react-redux";
import socket from "services/socket.js";
import { GUESSING, LOBBY } from "utils/generals/constants.js";
import {
  selectCardsOnTable,
  selectGame,
  selectGamePlayers,
  selectGameStatus,
  selectIsFirstTurn,
  selectPlayerHand,
  selectSelectedCardId,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import { useCallback } from "react";
import { Notify } from "notiflix";
import { discardHandToTable } from "utils/game/discardHandToTable.js";

export const useTellStory = gameId => {
  const currentGame = useSelector(selectGame(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const playerHand = useSelector(selectPlayerHand(gameId, playerId));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const isFirstTurn = useSelector(selectIsFirstTurn(gameId));
  const gameStatus = useSelector(selectGameStatus(gameId));
  const selectedCardId = useSelector(selectSelectedCardId(gameId, playerId));

  const tellStory = useCallback(() => {
    if (!selectedCardId) {
      console.warn("No card selected!");
      Notify.failure("No card selected!");
      return;
    }

    const movedCard = playerHand.find(c => c._id === selectedCardId);

    if (!movedCard) {
      console.warn("Selected card not found in hand!");
      Notify.failure("Selected card not found in hand!");
      return;
    }
    // If storyteller not defined, the player becomes the first storyteller
    // todo: logic for storytellerId === true (maybe just add "&& !isFirstTurn"?)
    if (!isFirstTurn) {
      const { updatedCardsOnTable, updatedPlayers } = discardHandToTable({
        playerHand,
        movedCards: [movedCard],
        cardsOnTable,
        userId: playerId,
        gamePlayers,
        isStoryteller: true,
      });

      const updatedGame = {
        ...currentGame,
        storytellerId: playerId,
        gameStatus: GUESSING,
        cardsOnTable: updatedCardsOnTable,
        players: updatedPlayers,
        isFirstTurn: gameStatus === LOBBY ? true : false,
      };

      socket.emit("setFirstStoryteller", { updatedGame }, response => {
        if (response?.error) {
          console.error("Failed to update game:", response.error);
        }
      });
    }
  }, [
    cardsOnTable,
    currentGame,
    gamePlayers,
    gameStatus,
    isFirstTurn,
    playerHand,
    selectedCardId,
    playerId,
  ]);

  return tellStory;
};
