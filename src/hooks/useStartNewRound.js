import { Notify } from "notiflix";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearingForNewRound } from "redux/game/gameSlice.js";
import { selectGame } from "redux/selectors.js";
import socket from "services/socket.js";
import { distributeCards } from "utils/game/distributeCards.js";
import { LOBBY } from "utils/generals/constants.js";

export const useStartNewRound = gameId => {
  const dispatch = useDispatch();

  const currentGame = useSelector(selectGame(gameId));

  const startNewRound = useCallback(() => {
    const updatedGame = distributeCards(currentGame); // роздаю карти
    console.log(" startNewRound >> updatedGame:::", updatedGame);

    // Обнуляю статуси гравців:
    const updatedPlayers = updatedGame.players.map(player => {
      return {
        ...player,
        isGuessed: false,
        isVoted: false,
      };
    });

    // Визначаю наступного оповідача:
    if (updatedGame.players.length === 0) {
      console.error("No players available to select a storyteller.");
      Notify.failure("No players available to select a storyteller.");
      return;
    }

    const storytellerIdx = updatedGame.players.findIndex(
      player => player._id === updatedGame.storytellerId,
    );

    // Якщо оповідач останній в масиві, то треба повертатись по колу до першого:
    const nextStorytellerIdx =
      (storytellerIdx + 1) % updatedGame.players.length;
    // Наприклад, для 4х гравців:
    // Якщо storytellerIdx = 0 (перший гравець), то (0 + 1) % 4 = 1 → наступний індекс 1.
    // Якщо storytellerIdx = 3 (останній гравець), то (3 + 1) % 4 = 4 % 4 = 0 → повертаємося до індексу 0 (перший гравець).

    const newStoryteller = updatedGame.players[nextStorytellerIdx];

    // Новий стан гри:
    const finalUpdatedGame = {
      ...updatedGame,
      players: updatedPlayers,
      currentRound: updatedGame.currentRound + 1, // todo перевірити чи десь потрібен)
      storytellerId: newStoryteller._id,
      votes: {}, // обнуляю голосування
      gameStatus: LOBBY, // встановлюю статус гри в початковий
      roundResults: [], // обнуляю результати раунду
    };

    socket.emit(
      "startNewRound",
      { updatedGame: finalUpdatedGame },
      response => {
        if (response?.error) {
          console.error("Failed to update game:", response.error);
        }
      },
    );

    // dispatch(clearingForNewRound(gameId)); // move to response from server
  }, [currentGame]);

  return startNewRound;
};
