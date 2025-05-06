import { Notify } from "notiflix";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
  selectIsSingleCardMode,
  selectLocalGame,
  selectUserCredentials,
  selectVotes,
} from "redux/selectors.js";

import { useOptimisticDispatch } from "./useOptimisticDispatch.js";
import { useTranslation } from "react-i18next";

export const useVote = (gameId, firstVotedCardId, secondVotedCardId) => {
  const { t } = useTranslation();
  const { optimisticUpdateDispatch } = useOptimisticDispatch();
  const currentGame = useSelector(selectLocalGame(gameId));
  const { players: gamePlayers } = currentGame;

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;

  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const votes = useSelector(selectVotes(gameId)); // { playerId: {firstVotedCardId, secondVotedCardIdn } }
  const playersMoreThanSix = gamePlayers.length > 6;

  const vote = useCallback(() => {
    if (
      !firstVotedCardId ||
      (!isSingleCardMode && playersMoreThanSix && !secondVotedCardId)
    ) {
      console.warn("Vote: Invalid card selection!");
      Notify.failure(t("err_invalid_card_selection"));
      return;
    }

    const updatedPlayers = gamePlayers.map(player =>
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
    t,
    votes,
  ]);

  return vote;
};
