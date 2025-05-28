import { gameApi } from "redux/game/gameApi.js";
import { clearGameInitialState } from "redux/game/gameSlice.js";
import { clearLocalStateForGameDelete } from "redux/game/localPersonalSlice.js";

export const gameDeleted = (
  game,
  dispatch,
  currentGameId,
  playerId,
  navigate,
) => {
  const { _id: deletingGameId } = game;
  // console.log(" deletingGameId:::", deletingGameId);

  if (!deletingGameId)
    throw new Error(`The deletingGameId is ${deletingGameId}`);

  // dispatch(clearActiveAction({}));
  // dispatch(setIsCreatingGame(false));
  dispatch(clearGameInitialState());

  dispatch(clearLocalStateForGameDelete(game._id));

  // Інвалідувати кеш для видаленої гри
  // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: deletingGameId }]));
  dispatch(gameApi.util.resetApiState());

  if (currentGameId === deletingGameId) {
    // console.log("current game was deleted, navigate to game");
    navigate(`/game`, { replace: true });
  }
};

// запуск getUserByToken:
// dispatch(authApi.util.invalidateTags(["User"]));
