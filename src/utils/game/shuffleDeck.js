export const shuffleDeck1 = deck => {
  return deck
    .map(card => ({ card, sortIndex: Math.random() })) // Додати випадковий індекс
    .sort((a, b) => a.sortIndex - b.sortIndex) // Сортування за цим індексом
    .map(({ card }) => card); // Повертаю тільки карти
};

// const newDeck = shuffleDeck(deck);

// Більш швидкий варіант (алгоритм Фішера-Йєтса (Fisher-Yates Shuffle))
export const shuffleDeck = deck => {
  const shuffled = [...deck]; // Створюємо копію масиву
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Міняємо елементи місцями
  }
  return shuffled;
};
