import { setUserActiveGameId } from "redux/game/localPersonalSlice.js";

export const userActiveGameIdUpdated = (userActiveGameId, dispatch) => {
  console.log("userActiveGameIdUpdate");
  dispatch(setUserActiveGameId(userActiveGameId ?? null)); // Оператор ?? для обробки undefined
};
