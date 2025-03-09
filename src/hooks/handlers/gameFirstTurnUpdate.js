import { gameApi } from "redux/game/gameApi.js";
import { updateGame } from "redux/game/gameSlice.js";

export const gameFirstTurnUpdate = (game, dispatch) => {
  console.log(" gameUpdate >> game:::", game);
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  //# якщо games (draft === gameSlice.games) - це об'єкт
  dispatch(
    gameApi.util.updateQueryData("getAllGames", undefined, draft => {
      if (game._id in draft) {
        // Якщо гра вже є, оновлюємо її
        dispatch(updateGame(game)); // оновлення gameSlice (для подальшої додачі гравців)
        draft[game._id] = game; // оновлення кешу gameApi (для рендерингу переліку ігор)
      }
    }),
  );
};
