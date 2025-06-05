import { Notify } from "notiflix";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  removeSelectedCardId,
  setCardsSet,
} from "redux/game/localPersonalSlice.js";
import { selectLocalGame, selectUserCredentials } from "redux/selectors.js";
import socket from "services/socket.js";
import { discardHandToTable } from "utils/game/discardHandToTable.js";

export const useGuess = gameId => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const userCredentials = useSelector(selectUserCredentials);
  const { _id: playerId } = userCredentials;
  const currentGame = useSelector(selectLocalGame(gameId));

  const guessStory = useCallback(
    cardsSet => {
      if (!currentGame) return;

      const { players, cardsOnTable, isSingleCardMode } = currentGame;
      const { firstGuessCardSet, secondGuessCardSet } = cardsSet;

      const playersMoreThanThree = players.length > 3;
      const playersMoreThanSix = players.length > 6;

      if (
        !firstGuessCardSet ||
        (!playersMoreThanThree && !secondGuessCardSet) ||
        (!isSingleCardMode && !secondGuessCardSet)
      ) {
        console.warn("guess Story: Invalid card selection!");
        Notify.failure(t("err_invalid_card_selection"));
        return;
      }

      const getMovedCards = () => {
        if (playersMoreThanThree && isSingleCardMode) {
          return [firstGuessCardSet];
        } else if (
          !playersMoreThanThree ||
          (playersMoreThanSix && !isSingleCardMode)
        ) {
          return [firstGuessCardSet, secondGuessCardSet];
        }
      };

      // const movedCards = playersMoreThanThree
      //   ? // || firstGuessCardSet._id === secondGuessCardSet._id
      //     [firstGuessCardSet]
      //   : [firstGuessCardSet, secondGuessCardSet];

      const currentPlayer = players.find(
        player => player._id === userCredentials._id,
      );

      const movedCards = getMovedCards();
      console.log({ movedCards, currentPlayerHand: currentPlayer?.hand });

      if (
        !movedCards.every(card => {
          return currentPlayer?.hand.some(c => {
            return c._id === card._id;
          });
        })
      ) {
        // console.warn("Not right data in card!");
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

      const emptyCardsSet = {
        firstGuessCardSet: null,
        secondGuessCardSet: null,
      };
      dispatch(setCardsSet({ gameId, playerId, cardsSet: emptyCardsSet })); // clear card set
    },
    [currentGame, dispatch, gameId, playerId, t, userCredentials._id],
  );

  return guessStory;
};
