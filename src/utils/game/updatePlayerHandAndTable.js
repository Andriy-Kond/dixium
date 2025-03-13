export const updatePlayerHandAndTable = ({
  playerHand,
  cardsToMove,
  cardsOnTable,
  newCards,
}) => {
  const updatedPlayerHand = playerHand.filter(
    card => !cardsToMove.some(c => c._id === card._id),
  );
  updatedPlayerHand.push(...newCards);
  const updatedCardsOnTable = [...cardsOnTable, ...cardsToMove];

  return { updatedPlayerHand, updatedCardsOnTable };
};
