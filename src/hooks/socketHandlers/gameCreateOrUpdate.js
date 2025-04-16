import { gameApi } from "redux/game/gameApi.js";
import { updateGame } from "redux/game/gameSlice.js";

export const gameCreateOrUpdate = (game, isNew, dispatch) => {
  console.log("gameCreateOrUpdate");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }
  // update Redux state:
  // refetchAllGames(); // призводить до оновлення всієї сторінки
  // or handle change of gameApi without refetchAllGames():

  //# якщо games (draft === gameSlice.games) - це масив
  // dispatch(
  //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
  //     const index = draft.findIndex(g => g._id === game._id);
  //     if (index === -1) {
  //       draft.push(game); // Додаємо нову гру, якщо її ще немає
  //     } else {
  //       dispatch(updateGame(game));
  //       draft[index] = game; // Оновлюємо гру, якщо вона вже існує
  //     }
  //   }),
  // );

  // # якщо games (draft === gameSlice.games) - це об'єкт
  // dispatch(
  //   gameApi.util.updateQueryData("getAllGames", undefined, draft => {
  //     if (!(game._id in draft)) {
  //       draft[game._id] = game; // Якщо гри немає в об’єкті, додаємо її
  //     } else {
  //       // Якщо гра вже є, оновлюємо її
  //       dispatch(updateGame(game)); // оновлення gameSlice (для подальшої додачі гравців)
  //       draft[game._id] = game; // оновлення кешу gameApi (для рендерингу переліку ігор)
  //     }
  //   }),
  // );

  // dispatch(
  //   gameApi.util.updateQueryData("getCurrentGame", game._id, draft => {
  //     // Змінено другий аргумент на game._id, оскільки gameApi -> getCurrentGame очікує gameId
  //     // draft — це об'єкт гри, просто замінюємо його
  //     Object.assign(draft, game); // Встановити чи оновити activeGame
  //     dispatch(updateGame(game)); // Оновити gameSlice для синхронізації
  //   }),
  // );

  // Миттєве оновлення поточного стану:
  dispatch(
    gameApi.util.updateQueryData("getCurrentGame", game._id, draft => {
      Object.assign(draft, game); // Встановити чи оновити activeGame
    }),
  );
  // Оновлення поточного стану через додатковий запит до сервера:
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
  // Оновлення стану slice:
  dispatch(updateGame(game));
};
