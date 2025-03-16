import { Notify } from "notiflix";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
  selectGame,
  selectGamePlayers,
  selectIsSingleCardMode,
  selectUserCredentials,
  selectVotes,
} from "redux/selectors.js";
import socket from "services/socket.js";

export const useVote = (cardsSet, gameId) => {
  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const votes = useSelector(selectVotes(gameId));
  // { playerId: { firstCard: null, secondCard: null }}

  // const votedCards =
  //   isSingleCardMode || firstCard._id === secondCard._id
  //     ? [firstCard]
  //     : [firstCard, secondCard];

  // if (!votedCards.every(card => cardsOnTable.some(c => c._id === card._id))) {
  //   console.warn("Not right data in card!");
  //   Notify.failure("Not right data in card!");
  //   return;
  // }
  const vote = useCallback(() => {
    const { firstCard, secondCard } = cardsSet;

    if (!firstCard || (!isSingleCardMode && !secondCard)) {
      console.warn("Invalid card selection!");
      Notify.failure("Invalid card selection!");
      return;
    }

    const updatedVotes = {
      ...votes,
      [userCredentials._id]: {
        firstCard: firstCard._id,
        secondCard: secondCard._id,
      },
    };

    const updatedPlayers = gamePlayers.map(player =>
      // todo скинути isVoted перед наступним раундом
      player._id === userCredentials._id
        ? { ...player, isVoted: true }
        : player,
    );

    const updatedGame = {
      ...currentGame,
      votes: updatedVotes,
      players: updatedPlayers,
    };

    socket.emit("playerVoting", { updatedGame }, response => {
      if (response?.error) {
        console.error("Failed to update game playerVoting:", response.error);
      }
    });
  }, [
    cardsSet,
    currentGame,
    gamePlayers,
    isSingleCardMode,
    userCredentials._id,
    votes,
  ]);

  return vote;
};
