import { Notify } from "notiflix";

import { setGameStatus } from "redux/game/gameSlice.js";
import { FINISH } from "utils/generals/constants.js";

export const gameEnd = (game, message, dispatch) => {
  console.log("gameEnd");
  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  const [maxId, maxVal] = Object.entries(game.scores).reduce(
    ([maxKey, maxValue], [key, value]) =>
      value > maxValue ? [key, value] : [maxKey, maxValue],
  );

  const maxEntries = Object.entries(game.scores).filter(
    ([key, value]) => value === maxVal,
  );

  const winners = game.players.filter(p =>
    maxEntries.some(([key, value]) => key === p._id),
  );

  console.log(`The winner(s):`, winners);
  winners.map(winner => Notify.success(`Player ${winner.name} is winner!`));

  // dispatch(setGameStatus({ gameId: game._id, status: FINISH }));
  dispatch(setGameStatus({ status: FINISH }));
};
