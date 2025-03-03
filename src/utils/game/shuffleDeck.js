export const shuffleDeck = deck => {
  return deck
    .map(card => ({ card, sortIndex: Math.random() })) // Додати випадковий індекс
    .sort((a, b) => a.sortIndex - b.sortIndex) // Сортування за цим індексом
    .map(({ card }) => card); // Повертаю тільки карти
};

// const newDeck = shuffleDeck(deck);
