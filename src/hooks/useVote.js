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
// import { updatePlayerVote } from "redux/game/gameSlice.js";

export const useVote = (gameId, firstVotedCardId, secondVotedCardId) => {
  const { optimisticUpdateDispatch } = useOptimisticDispatch();

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const currentGame = useSelector(selectGame(gameId));
  const gamePlayers = useSelector(selectGamePlayers(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const votes = useSelector(selectVotes(gameId)); // { playerId: {firstVotedCardId, secondVotedCardIdn } }
  const playersMoreThanSix = gamePlayers.length > 6;

  const vote = useCallback(() => {
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
      player._id === playerId ? { ...player, isVoted: true } : player,
    );

    const updatedGame = {
      ...currentGame,
      votes: {
        ...votes,
        [playerId]: {
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
    firstVotedCardId,
    gamePlayers,
    isSingleCardMode,
    optimisticUpdateDispatch,
    playerId,
    playersMoreThanSix,
    secondVotedCardId,
    votes,
  ]);

  return vote;
};
