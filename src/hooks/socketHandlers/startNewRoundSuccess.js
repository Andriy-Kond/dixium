import { gameApi } from "redux/game/gameApi.js";
import {
  clearLocalStateForNewRound,
  setActiveScreen,
  setIsCarouselModeHandScreen,
  setIsCarouselModeTableScreen,
  updateLocalGame,
} from "redux/game/localPersonalSlice.js";

export const startNewRoundSuccess = (
  game,
  message,
  dispatch,
  activeActions,
  playerId,
) => {
  // console.log("startNewRoundSuccess");

  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateLocalGame(game));
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
  dispatch(clearLocalStateForNewRound());

  dispatch(
    setActiveScreen({
      gameId: game._id,
      playerId,
      screen: 0,
    }),
  );

  dispatch(
    setIsCarouselModeTableScreen({
      gameId: game._id,
      playerId,
      isCarouselModeTableScreen: false,
    }),
  );

  dispatch(
    setIsCarouselModeHandScreen({
      gameId: game._id,
      playerId,
      isCarouselModeHandScreen: false,
    }),
  );
};
