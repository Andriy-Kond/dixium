import { Notify } from "notiflix";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectLocalGame, selectUserCredentials } from "redux/selectors.js";
import socket from "services/socket.js";
import { discardHandToTable } from "utils/game/discardHandToTable.js";

export const useGuess = (gameId, cardsSet) => {
  const { t } = useTranslation();
  const userCredentials = useSelector(selectUserCredentials);
  const currentGame = useSelector(selectLocalGame(gameId));
  const { players, cardsOnTable } = currentGame;

  const guessStory = useCallback(() => {
    const { firstGuessCardSet, secondGuessCardSet } = cardsSet;

    const playersMoreThanThree = players.length > 3;

    if (!firstGuessCardSet || (!playersMoreThanThree && !secondGuessCardSet)) {
      console.warn("guess Story: Invalid card selection!");
      Notify.failure(t("err_invalid_card_selection"));
      return;
    }

    const movedCards = playersMoreThanThree
      ? // || firstGuessCardSet._id === secondGuessCardSet._id
        [firstGuessCardSet]
      : [firstGuessCardSet, secondGuessCardSet];

    const currentPlayer = players.find(
      player => player._id === userCredentials._id,
    );

    if (
      !movedCards.every(card =>
        currentPlayer?.hand.some(c => c._id === card._id),
      )
    ) {
      console.warn("Not right data in card!");
      Notify.failure(t("err_not_right_data_in_card"));
      return;
    }

    const { updatedCardsOnTable, updatedPlayers } = discardHandToTable({
      playerHand: currentPlayer?.hand || [],
      movedCards,
      cardsOnTable: cardsOnTable,
      userId: userCredentials._id,
      gamePlayers: players,
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
  }, [cardsOnTable, cardsSet, currentGame, players, t, userCredentials._id]);

  return guessStory;
};
