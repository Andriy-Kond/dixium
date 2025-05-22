import socket from "services/socket.js";

export const joinToGameRoom = (gameId, userId, userActiveGameId, dispatch) => {
  // console.log("вхід у joinToGameRoom");

  if (gameId && gameId === userActiveGameId && socket.connected && userId) {
    // console.log("joinToGameRoom -  send emit");
    // console.log({ gameId, userActiveGameId, userId });

    socket.emit("joinToGameRoom", {
      gameId,
      userId,
    });

    // dispatch(authApi.util.invalidateTags(["User"])); // update authApi
    // dispatch(gameApi.util.invalidateTags([{ type: "Game", id: gameId }]));
    // dispatch(gameApi.util.invalidateTags(["Game"]));
    // dispatch(gameApi.util.getCurrentGame(gameId));
  }
};

// const optimisticCardsListUpdate = useCallback(
//   ({ previousGameState, gameId, cards, timeout = 2000 }) => {
//     console.log("optimisticCardsListUpdate");
//     const eventName = "CardsList_Update";
//     setGameDeck({ gameId, cards }); // оптимістичне оновлення стану
//     socket.emit(eventName, { updatedGame: currentGame }); // запит на сервер для оновлення і на сервері

//     // Встановлення таймеру для відкату, якщо щось пішло не так
//     const timer = setTimeout(() => {
//       Notify.failure(t("err_no_response_server"), {
//         eventName: eventName,
//       });

//       // Встановлення попереднього стану, якщо час вийшов, а відповіді від сервера не надійшло
//       dispatch(
//         setGameDeck({
//           gameId: previousGameState._id,
//           cards: previousGameState.deck,
//         }),
//       );
//     }, timeout);

//     const key = `${eventName}-${gameId}`;
//     // Записую в стейт таймер для скидання, якщо запит успішний і попередній стан для відкату, якщо прийшла помилка
//     dispatch(
//       setActiveActionTest({
//         key,
//         value: { timer, previousGameState, eventName },
//       }),
//     );
//   },
//   [currentGame, dispatch, t],
// );

// useEffect(() => {
//   if (!currentGame) return;

//   console.log("GamesListPage set game Deck:::", currentGame.deck);

//   if (currentGame.deck) {
//     optimisticCardsListUpdate({
//       previousGameState: currentGame,
//       gameId: currentGame._id,
//       cards: currentGame.deck,
//     });
//   }
// }, [currentGame, optimisticCardsListUpdate]);
