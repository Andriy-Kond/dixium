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
  console.log("startNewRoundSuccess");

  if (!game) {
    throw new Error(`The game is ${game}`);
  }

  dispatch(updateLocalGame(game));
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
