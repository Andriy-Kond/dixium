import { setIsShowMask } from "redux/game/localPersonalSlice.js";
import { gameApi } from "redux/game/gameApi.js";
import { updateGame } from "redux/game/gameSlice.js";

export const gameFirstTurnUpdate = (game, dispatch, playerId) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  //# якщо games (draft === gameSlice.games) - це об'єкт
  // dispatch(
  //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
  //     if (game._id in draft) {
  //       // Якщо гра вже є, оновлюємо її
  //       dispatch(updateGame(game)); // оновлення gameSlice (для подальшої додачі гравців)
  //       draft[game._id] = game; // оновлення кешу gameApi (для рендерингу переліку ігор)
  //     }
  //   }),
  // );

  // Миттєве оновлення локального стану:
  dispatch(
    gameApi.util.updateQueryData("getCurrentGame", game._id, draft => {
      // Змінено другий аргумент на game._id, оскільки gameApi -> getCurrentGame очікує gameId
      // draft — це об'єкт гри, просто замінюємо його
      Object.assign(draft, game); // Встановити чи оновити activeGame
    }),
  );

  dispatch(updateGame(game)); // Оновити gameSlice для синхронізації
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }])); // додатковий запит на сервер для синхронізації

  dispatch(
    setIsShowMask({
      gameId: game._id,
      playerId,
      isShow: false,
    }),
  );
};
