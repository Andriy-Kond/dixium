import { gameApi } from "redux/game/gameApi.js";
import { updateGame } from "redux/game/gameSlice.js";

export const userDeletedFromGame = (game, dispatch) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(
    gameApi.util.updateQueryData("getCurrentGame", game._id, draft => {
      // Другий аргумент - це game._id, оскільки gameApi -> getCurrentGame очікує gameId
      // Тут draft — це об'єкт гри, просто замінюємо його
      Object.assign(draft, game); // Встановити чи оновити activeGame
    }),
  );

  dispatch(updateGame(game)); // Оновити gameSlice для синхронізації
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }])); // запит на сервер для синхронізації стану
};
