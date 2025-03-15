import { useSelector } from "react-redux";
import socket from "services/socket.js";
import { VOTING } from "utils/generals/constants.js";
import {
  selectCardsOnTable,
  selectGame,
  selectGamePlayers,
  selectIsFirstTurn,
  selectPlayerHand,
  selectStorytellerId,
  selectUserCredentials,
} from "redux/selectors.js";
import { useCallback } from "react";
import { Notify } from "notiflix";
import { discardHandToTable } from "utils/game/discardHandToTable.js";

export const useTellStory = (gameId, selectedCardId, setSelectedCardId) => {
  const currentGame = useSelector(selectGame(gameId));
  const userCredentials = useSelector(selectUserCredentials);
  const playerHand = useSelector(selectPlayerHand(gameId, userCredentials._id));
  const storytellerId = useSelector(selectStorytellerId(gameId));
  const cardsOnTable = useSelector(selectCardsOnTable(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const isFirstTurn = useSelector(selectIsFirstTurn(gameId));

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
      // // Скидання карт з руки на стіл
      // const updatedPlayerHand = playerHand.filter(
      //   handCard => handCard._id !== movedCard._id,
      // );
      // const updatedCardsOnTable = [...cardsOnTable, movedCard];

      // // Перезапис руки плеера і мітка, що він походив

      // const updatedPlayers = gamePlayers.map(player =>
      //   // todo скинути isVoted перед наступним раундом
      //   player._id === userCredentials._id
      //     ? { ...player, hand: updatedPlayerHand, isVoted: true }
      //     : player,
      // );

      const { updatedCardsOnTable, updatedPlayers } = discardHandToTable({
        playerHand,
        movedCards: [movedCard],
        cardsOnTable,
        userId: userCredentials._id,
        gamePlayers,
      });

      const updatedGame = {
        ...currentGame,
        storytellerId: userCredentials._id,
        gameStatus: VOTING,
        cardsOnTable: updatedCardsOnTable,
        players: updatedPlayers,
        isFirstTurn: storytellerId ? true : false,
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
    gamePlayers,
    isFirstTurn,
    playerHand,
    selectedCardId,
    setSelectedCardId,
    storytellerId,
    userCredentials._id,
  ]);

  return tellStory;
};
