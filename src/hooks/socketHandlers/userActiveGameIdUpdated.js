import { setUserActiveGameId } from "redux/game/localPersonalSlice.js";

export const userActiveGameIdUpdated = (userActiveGameId, dispatch) => {
  console.log("userActiveGameIdUpdate");
  console.log(
    " userActiveGameIdUpdated >> userActiveGameId:::",
    userActiveGameId,
  );
  dispatch(setUserActiveGameId(userActiveGameId ?? null)); // Оператор ?? для обробки undefined
};
