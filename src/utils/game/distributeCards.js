import { shuffleDeck } from "./shuffleDeck.js";

export const distributeCards = currentGame => {
  const { deck, discardPile, players, cardsOnTable } = currentGame;
  const updatedDeck = [...deck];
  const updatedDiscardPile = [...discardPile, ...cardsOnTable]; // домішую карти зі стола у відбій

  const cardsPerPlayer = players.length > 3 ? 6 : 7;

  // Якщо карт у колоді недостатньо, то спочатку треба додати карти з "відбою" в колоду (перемішані)
  if (updatedDeck.length < cardsPerPlayer * players.length) {
    console.log("недостатньо карт в колоді, замішую відбій");
    updatedDeck.push(...shuffleDeck(updatedDiscardPile));
    updatedDiscardPile.length = 0;
  }

  // Коли карт достатньо, то треба роздати карти гравцям
  if (updatedDeck.length >= cardsPerPlayer * players.length) {
    const updatePlayers = players.map(player => {
      const leftCardsInPlayerHand = player.hand.length;

      const moveCardsQty = cardsPerPlayer - leftCardsInPlayerHand;

      const updatedHand = [
        ...player.hand,
        ...updatedDeck.splice(0, moveCardsQty), // видаляє певну кількість елементів із масиву updatedDeck, починаючи з першого елементу масиву (індекс 0) і повертає їх як новий масив.
      ];

      return {
        ...player,
        hand: updatedHand,
      };
    });

    return {
      ...currentGame,
      deck: updatedDeck, // оновлена колода
      discardPile: updatedDiscardPile, // з домішаними картами зі стола, або 0, якщо було домішано у колоду
      cardsOnTable: [], // карти на столі вже у відбої
      players: updatePlayers, // оновлені player.hand
    };
  }

  // Якщо карт недостатньо для роздачі (незалежно від того, що ми додали з відбою), можемо повернути поточний стан гри або іншу обробку
  return {
    ...currentGame,
    message: "Not enough cards in the deck",
  };
};
