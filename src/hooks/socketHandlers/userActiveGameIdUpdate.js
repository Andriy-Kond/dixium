import { setUserActiveGameId } from "redux/game/localPersonalSlice.js";

export const userActiveGameIdUpdate = (userActiveGameId, dispatch) => {
  console.log("userActiveGameIdUpdate");

  // if (!userActiveGameId)
  //   throw new Error(`The userActiveGameId is ${userActiveGameId}`);

  dispatch(setUserActiveGameId(userActiveGameId ?? null)); // Оператор ?? для обробки undefined
};
