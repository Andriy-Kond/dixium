// Допоміжна функція для підготовки даних для рендерингу результатів
// Для кожної карти на столі повертає об’єкт із:
//     ID карти, назвою, URL.
//     Ім’ям власника (ownerName).
//     Масивом голосів (votesForCard), де для кожного гравця, який голосував, вказується його ім’я та кількість голосів (1 або 2).

export function prepareRoundResults({
  cardsOnTable,
  votes,
  gamePlayers,
  storytellerId,
}) {
  const results = cardsOnTable.map(card => {
    const ownerPlayer = gamePlayers.find(p => p._id === card.ownerId);
    const votesForThisCard = [];

    Object.entries(votes).forEach(([playerId, vote]) => {
      let voteCount = 0;

      if (vote.firstVotedCardId === card._id) voteCount++;
      if (vote.secondVotedCardId === card._id) voteCount++;
      if (voteCount > 0) {
        const voter = gamePlayers.find(p => p._id === playerId);

        votesForThisCard.push({
          playerName: voter.name,
          voteCount, // 1 або 2 зірочки
        });
      }
    });

    return {
      cardId: card._id,
      cardName: card.cardName,
      url: card.url,
      ownerId: card.ownerId,
      ownerName: ownerPlayer.name,
      votesForThisCard,
    };
  });

  // todo розставити карти в масиві по порядку, який скаже Антон

  // Сортування - картка оповідача на перше місце
  results.sort((a, b) => {
    if (a.ownerId === storytellerId) return -1; // a йде на перед
    if (b.ownerId === storytellerId) return 1; // b йде на перед
    return 0; // порядок не змінюється
  });

  return results;
}
