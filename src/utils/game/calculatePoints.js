export function calculatePoints({
  gamePlayers,
  storytellerId,
  cardsOnTable,
  votes,
  scores,
  isSingleCardMode,
}) {
  // Ініціалізація нових балів на основі поточних
  const updatedScores = { ...scores };
  const playerCount = gamePlayers.length;

  // Ініціалізація балів, якщо гравець ще не має їх
  gamePlayers.forEach(player => {
    if (!updatedScores[player._id]) updatedScores[player._id] = 0;
  });

  // Знаходимо карту оповідача
  const storytellerCard = cardsOnTable.find(
    card => card.owner === storytellerId,
  );
  const storytellerCardId = storytellerCard._id;

  // Підрахунок кількості голосів за карту оповідача
  let votesForStorytellerCard = 0;
  Object.entries(votes).forEach(([voterId, vote]) => {
    if (vote.firstVotedCardId === storytellerCardId) votesForStorytellerCard++;
    if (vote.secondVotedCardId === storytellerCardId) votesForStorytellerCard++;
  });

  // Логіка підрахунку балів
  const allVotedForStoryteller = votesForStorytellerCard === playerCount - 1; // -1, бо оповідач не голосує за себе
  const noneVotedForStoryteller = votesForStorytellerCard === 0;

  // * Правила для 3 гравців, та стандартні правила для 4-6 гравців або 7-12 з isSingleCardMode
  if (allVotedForStoryteller || noneVotedForStoryteller) {
    updatedScores[storytellerId] += 0; // Оповідач отримує 0
    gamePlayers.forEach(player => {
      if (player._id !== storytellerId) updatedScores[player._id] += 2; // Інші по 2
    });
  } else {
    updatedScores[storytellerId] += 3; // Оповідач отримує 3
    Object.entries(votes).forEach(([voterId, vote]) => {
      if (
        voterId !== storytellerId &&
        (vote.firstVotedCardId === storytellerCardId ||
          vote.secondVotedCardId === storytellerCardId)
      ) {
        updatedScores[voterId] += 3; // Вгадали карту оповідача - 3 бали
      }
    });
  }

  // Додаткові бали за голоси за карти гравців (максимум 3)
  const bonusPoints = {};
  Object.entries(votes).forEach(([voterId, vote]) => {
    // Беру проголосовані гравцем карти і шукаю їх на столі:
    [vote.firstVotedCardId, vote.secondVotedCardId].forEach(cardId => {
      if (cardId) {
        const card = cardsOnTable.find(c => c._id === cardId);
        // Голосувати за свою карту не можна:
        if (card && card.owner !== voterId) {
          // Якщо проголосована гравцем карта знайдена на столі і це не його карта, то додатковий бонусний бал власнику карти:
          bonusPoints[card.owner] = (bonusPoints[card.owner] || 0) + 1;
        }
      }
    });
  });
  Object.entries(bonusPoints).forEach(([playerId, points]) => {
    if (playerId !== storytellerId)
      updatedScores[playerId] += Math.min(points, 3); // гравець може отримати максимум 3 бали, навіть якщо його points більше.
  });

  // * Додаткове правило Odyssey для 7-12 гравців без isSingleCardMode
  if (playerCount >= 7 && !isSingleCardMode) {
    // Додатковий бал за два голоси за правильну карту
    Object.entries(votes).forEach(([playerId, vote]) => {
      if (
        vote.firstVotedCardId === vote.secondVotedCardId &&
        vote.firstVotedCardId === storytellerCardId &&
        playerId !== storytellerId
      ) {
        updatedScores[playerId] += 1;
      }
    });
  }

  return updatedScores;
}
