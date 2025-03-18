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

import { useOptimisticDispatch } from "./useOptimisticDispatch.js";

export const useVote = gameId => {
  const { optimisticUpdateDispatch } = useOptimisticDispatch();

  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const votes = useSelector(selectVotes(gameId));
  // { playerId: {firstVotedCardId: firstVotedCardId, secondVotedCardId: secondVotedCardId} }
  const playersMoreThanSix = gamePlayers.length > 6;

  const vote = useCallback(() => {
    const playerVotes = votes[userCredentials._id] || {};
    const { firstVotedCardId, secondVotedCardId } = playerVotes;

    if (
      !firstVotedCardId ||
      (!isSingleCardMode && playersMoreThanSix && !secondVotedCardId)
    ) {
      console.warn("Invalid card selection!");
      Notify.failure("Invalid card selection!");
      return;
    }

    const updatedPlayers = gamePlayers.map(player =>
      // todo скинути isVoted перед наступним раундом
      player._id === userCredentials._id
        ? { ...player, isVoted: true }
        : player,
    );

    const updatedGame = {
      ...currentGame,
      votes: {
        ...votes,
        [userCredentials._id]: {
          firstVotedCardId,
          secondVotedCardId,
        },
      },
      players: updatedPlayers,
    };

    optimisticUpdateDispatch({
      eventName: "playerVoting",
      updatedGame,
    });
  }, [
    currentGame,
    gamePlayers,
    isSingleCardMode,
    optimisticUpdateDispatch,
    playersMoreThanSix,
    userCredentials._id,
    votes,
  ]);

  return vote;
};
