import { authApi } from "redux/auth/authApi.js";
// import { setUserCredentials } from "redux/auth/authSlice.js";
import { setLocalGame } from "redux/game/localPersonalSlice.js";

export const userDeletedFromGame = ({
  game,
  deletedUser,
  userCredentials,
  dispatch,
}) => {
  console.log("userDeletedFromGame");

  if (!game) throw new Error(`The game is ${game}`);

  //  deletedUser can be undefined if not found on server
  if (deletedUser?._id === userCredentials._id) {
    dispatch(setLocalGame({}));
    // dispatch(setUserCredentials(deletedUser));
    dispatch(authApi.util.invalidateTags(["User"]));
  } else {
    dispatch(setLocalGame(game));
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
};
