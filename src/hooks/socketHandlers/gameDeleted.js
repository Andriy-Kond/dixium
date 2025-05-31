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
  dispatch(clearGameInitialState()); // clear gameSlice
  dispatch(clearLocalStateForGameDelete(game._id)); // clear part of localPersonalSlice

  // dispatch(gameApi.util.resetApiState()); // очистити стан повністю (разом з кешем getAllDecks, getCurrentDeck, etc.)
  // Оптимістичне оновлення кешу: видалити гру
  dispatch(
    gameApi.util.updateQueryData("getCurrentGame", deletingGameId, () => null),
  );
  // "getCurrentGame" — це назва ендпоінта, для якого оновлюється кеш.
  // deletingGameId — аргумент (ідентифікатор гри), для якого змінюється кеш.
  // () => null — функція, яка визначає нове значення кешу (в цьому випадку null).

  // Інвалідувати тег для консистентності (якщо видалено було дарма, то буде новий запит)
  dispatch(gameApi.util.invalidateTags([{ type: "Game", id: deletingGameId }]));

  if (currentGameId === deletingGameId) {
    // console.log("current game was deleted, navigate to game");
    navigate(`/game`, { replace: true });
  }
};
