import { Notify } from "notiflix";
import { gameApi } from "redux/game/gameApi.js";
import { setLocalGameStatus } from "redux/game/localPersonalSlice.js";
import { FINISH } from "utils/generals/constants.js";

export const gameEnd = (game, message, dispatch) => {
  // console.log("gameEnd");

  if (!game) throw new Error(`The game is ${game}`);

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

  // console.log(`The winner(s):`, winners);
  winners.map(winner => Notify.success(`Player ${winner.name} is winner!`));

  dispatch(setLocalGameStatus(FINISH)); // встановлюється на сервері також
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
};
