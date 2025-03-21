import { Notify } from "notiflix";
import { gameApi } from "redux/game/gameApi.js";
import { updateCurrentPlayer } from "redux/game/gameSlice.js";

export const gameEntry = (game, player, dispatch) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  if (!player) {
    throw new Error(`The player is ${player}`);
  }

  dispatch(
    gameApi.util.updateQueryData("getAllGames", undefined, draft => {
      // Якщо гра вже є, оновлюємо її
      if (game._id in draft) {
        const currentGame = draft[game._id];

        if (currentGame) {
          draft[game._id].isGameStarted = game.isGameStarted;

          const playerIdx = currentGame.players.findIndex(
            p => p._id === player._id,
          );

          if (playerIdx !== -1) {
            currentGame.players[playerIdx] = player;
            // оновлення кешу gameApi Redux
            // dispatch(updateCurrentPlayer({ gameId: game._id, player })); // оновлення gameSlice
          } else {
            currentGame.players.push(player);
          }
          dispatch(updateCurrentPlayer({ gameId: game._id, player })); // оновлення gameSlice
        }
      } else {
        console.log(`Game ${game._id} not found`);
        Notify.failure(`Game with ID ${game._id} not found`);
      }
    }),
  );
};
