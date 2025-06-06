import { setIsShowMask } from "redux/game/localPersonalSlice.js";

export const gameFirstTurnUpdate = (game, dispatch, playerId) => {
  console.log("gameFirstTurnUpdate");

  if (!game) throw new Error(`The game is ${game}`);

  dispatch(
    setIsShowMask({
      gameId: game._id,
      playerId,
      isShow: false,
    }),
  );
};
