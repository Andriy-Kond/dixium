import { updateGame } from "redux/game/gameSlice.js";

export const firstStorytellerUpdated = (game, dispatch) => {
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateGame(game));
  // dispatch(
  //   setFirstStoryteller({
  //     gameId: game._id,
  //     playerId: userCredentials._id,
  //   }),
  // );
  // dispatch(setGameStatus({ gameId: game._id, status: MAKING_TURN }));
};
