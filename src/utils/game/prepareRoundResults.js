// Допоміжна функція для підготовки даних для рендерингу результатів
// Для кожної карти на столі повертає об’єкт із:
//     ID карти, назвою, URL.
//     Ім’ям власника (ownerName).
//     Масивом голосів (votesForCard), де для кожного гравця, який голосував, вказується його ім’я та кількість голосів (1 або 2).
export function prepareRoundResults({ cardsOnTable, votes, gamePlayers }) {
  const results = cardsOnTable.map(card => {
    const ownerPlayer = gamePlayers.find(p => p._id === card.owner);
    const votesForCard = [];

    Object.entries(votes).forEach(([playerId, vote]) => {
      let voteCount = 0;
      if (vote.firstVotedCardId === card._id) voteCount++;
      if (vote.secondVotedCardId === card._id) voteCount++;
      if (voteCount > 0) {
        const voter = gamePlayers.find(p => p._id === playerId);
        votesForCard.push({
          playerName: voter.name,
          voteCount, // 1 або 2 зірочки
        });
      }
    });

    return {
      cardId: card._id,
      cardName: card.cardName,
      url: card.url,
      ownerName: ownerPlayer.name,
      votesForCard,
    };
  });

  return results;
}
