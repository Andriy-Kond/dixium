export const discardHandToTable = ({
  playerHand,
  movedCards,
  cardsOnTable,
  userId,
  gamePlayers,
  isStoryteller,
}) => {
  // Додавання власника до скинутих карт
  const updatedMovedCards = movedCards.map(card => ({
    ...card,
    ownerId: userId,
  }));

  // Скидання карт з руки на стіл
  const updatedPlayerHand = playerHand.filter(
    // handCard => !movedCards.some(movedCard => handCard._id === movedCard._id),
    handCard =>
      updatedMovedCards.every(movedCard => handCard._id !== movedCard._id),
  );
  const updatedCardsOnTable = [...cardsOnTable, ...updatedMovedCards];

  // Перезапис руки плеера і мітка, що він походив
  const updatedPlayers = gamePlayers.map(player =>
    // todo скинути isGuessed перед наступним раундом
    player._id === userId
      ? {
          ...player,
          hand: updatedPlayerHand,
          isGuessed: true,
          isVoted: isStoryteller,
        }
      : player,
  );

  return { updatedCardsOnTable, updatedPlayers };
};
