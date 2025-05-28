import { setUserActiveGameId } from "redux/game/localPersonalSlice.js";

export const userActiveGameIdUpdated = (userActiveGameId, dispatch) => {
  // console.log("userActiveGameIdUpdate");
  if (typeof userActiveGameId === "string" && userActiveGameId.trim() !== "") {
    dispatch(setUserActiveGameId(userActiveGameId));
  } else {
    dispatch(setUserActiveGameId(null));
  }
};
