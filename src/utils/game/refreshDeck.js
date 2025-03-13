import { shuffleDeck } from "./shuffleDeck.js";

export const refreshDeck = ({ deck, discardPile, drawQty }) => {
  const updatedDeck = [...deck];
  const updatedDiscardPile = [...discardPile];

  if (updatedDeck.length < drawQty) {
    if (updatedDiscardPile.length < drawQty) {
      console.warn("No cards left in deck or discard pile!");
      return null;
    }
    updatedDeck.push(...shuffleDeck([...updatedDiscardPile]));
    updatedDiscardPile.length = 0;
  }

  const newCards = updatedDeck.splice(0, drawQty);
  return { updatedDeck, updatedDiscardPile, newCards };
};
