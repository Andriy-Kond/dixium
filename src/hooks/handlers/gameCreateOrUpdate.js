import { gameApi } from "redux/game/gameApi.js";
import { updateGame } from "redux/game/gameSlice.js";

export const gameCreateOrUpdate = (game, dispatch) => {
  // update Redux state:
  // refetchAllGames(); // призводить до оновлення всієї сторінки
  // or handle change of gameApi without refetchAllGames():
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

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

  //# якщо games (draft === gameSlice.games) - це об'єкт
  dispatch(
    gameApi.util.updateQueryData("getAllGames", undefined, draft => {
      if (!(game._id in draft)) {
        draft[game._id] = game; // Якщо гри немає в об’єкті, додаємо її
      } else {
        // Якщо гра вже є, оновлюємо її
        dispatch(updateGame(game)); // оновлення gameSlice (для подальшої додачі гравців)
        draft[game._id] = game; // оновлення кешу gameApi (для рендерингу переліку ігор)
      }
    }),
  );
};
