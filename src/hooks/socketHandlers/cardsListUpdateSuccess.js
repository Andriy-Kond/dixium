import { Notify } from "notiflix";
import { gameApi } from "redux/game/gameApi.js";
import { clearActiveActionTest } from "redux/game/gameSlice.js";
import { setGameDeck } from "redux/game/localPersonalSlice.js";

export const cardsListUpdateSuccess = (
  game,
  errorMessage,
  dispatch,
  activeActionsTest,
) => {
  // console.log("cardsListUpdateSuccess");

  const relatedAction = Object.values(activeActionsTest).find(
    value => value.previousGameState._id === game._id,
  );

  if (relatedAction) {
    // Логіка для ініціатора
    const key = `${relatedAction.eventName}-${game._id}`;

    if (errorMessage) {
      Notify.failure(`error: ${errorMessage}`);
      dispatch(
        setGameDeck({
          gameId: activeActionsTest.value.previousGameState._id,
          cards: activeActionsTest.value.previousGameState.deck,
        }),
      );
    } else {
      // встановлюю, якщо все гаразд, або якщо success-відповідь прийшла після спрацювання таймеру
      dispatch(
        setGameDeck({
          gameId: game._id,
          cards: game.deck,
        }),
      );

      dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
    }

    // скидаю таймер і видаляю подію зі стеку
    if (relatedAction.timer) {
      clearTimeout(relatedAction.timer);
      dispatch(clearActiveActionTest(key));
    }
  } else {
    // Логіка для інших гравців
    if (errorMessage) Notify.failure(`error: ${errorMessage}`);
    else {
      dispatch(
        setGameDeck({
          gameId: game._id,
          cards: game.deck,
        }),
      );
      dispatch(gameApi.util.invalidateTags([{ type: "Game", id: game._id }]));
    }
  }
};
