import { shuffleDeck } from "./shuffleDeck.js";

export const distributeCards = currentGame => {
  const { deck, discardPile, players } = currentGame;
  const updatedDeck = [...deck];
  const updatedDiscardPile = [...discardPile];

  const cardsPerPlayer = players.length > 3 ? 6 : 7;

  // Якщо карт у колоді недостатньо — додаємо карти з "відбою" в колоду та перемішуємо
  if (updatedDeck.length < cardsPerPlayer * players.length) {
    updatedDeck.push(...shuffleDeck(updatedDiscardPile));
    updatedDiscardPile.length = 0;
  }

  // Роздаємо карти гравцям
  if (updatedDeck.length >= cardsPerPlayer * players.length) {
    players.forEach(player => {
      player.hand = updatedDeck.splice(0, cardsPerPlayer);
    });
  }

  return {
    ...currentGame,
    deck: updatedDeck,
    discardPile: updatedDiscardPile,
    players,
  };
};
