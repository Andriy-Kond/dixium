export function calculatePoints({
  players,
  storytellerId,
  cardsOnTable,
  votes, // { playerId: {firstVotedCardId, secondVotedCardId }, }, - Голоси гравців
  scores,
  isSingleCardMode,
}) {
  // Ініціалізація нових балів на основі поточних
  const updatedScores = { ...scores };
  const playerCount = players.length;

  // Ініціалізація балів, якщо гравець ще не має їх
  players.forEach(player => {
    if (!updatedScores[player._id]) updatedScores[player._id] = 0;
    //// console.log(" бали гравців на початку updatedScores:::", updatedScores);
  });

  // Знаходимо карту оповідача
  const storytellerCard = cardsOnTable.find(
    card => card.ownerId === storytellerId,
  );
  const storytellerCardId = storytellerCard._id;

  // Підрахунок кількості голосів за карту оповідача
  let votesForStorytellerCard = 0;
  Object.entries(votes).forEach(([voterId, vote]) => {
    if (
      vote.firstVotedCardId === storytellerCardId ||
      vote.secondVotedCardId === storytellerCardId
    ) {
      votesForStorytellerCard++;
    }
  });

  // Логіка підрахунку балів
  const allVotedForStoryteller = votesForStorytellerCard === playerCount - 1; // -1, бо оповідач не голосує
  const noneVotedForStoryteller = votesForStorytellerCard === 0;

  //// console.log(" playerCount:::", playerCount);
  //// console.log(" votesForStorytellerCard:::", votesForStorytellerCard);

  // * Правила для 3 гравців, та стандартні правила для 4-6 гравців або 7-12 з isSingleCardMode
  if (allVotedForStoryteller || noneVotedForStoryteller) {
    console.log(
      "або ніхто не вгадав, або всі вгадали - всім по 2 бали, оповідачу - 0 і кінець підрахунку",
    );
    updatedScores[storytellerId] += 0; // Оповідач отримує 0

    players.forEach(player => {
      if (player._id !== storytellerId) {
        //// console.log(" storytellerId:::", storytellerId);
        //// console.log("гравець отримає 2 бали:>> ", player._id);
        updatedScores[player._id] += 2;
      } // Інші по 2
    });
    return updatedScores;
  }

  console.log(
    "хтось вгадав карту оповідача, але не всі: оповідачу - 3 бали, всім хто вгадав теж по 3 бали",
  );

  updatedScores[storytellerId] += 3; // Оповідач отримує 3
  //// console.log("Оповідач отримує 3 бали updatedScores:::", updatedScores);

  Object.entries(votes).forEach(([voterId, vote]) => {
    if (
      voterId !== storytellerId &&
      (vote.firstVotedCardId === storytellerCardId ||
        vote.secondVotedCardId === storytellerCardId)
    ) {
      updatedScores[voterId] += 3; // Вгадали карту оповідача - 3 бали
      // console.log(`Гравець ${voterId} отримує 3 бали (бо вгадав)`);
      // console.log(
      //   `І у гравця ${voterId} стає ${updatedScores[voterId]} балів`,
      // );
    }
  });

  // Додаткові бали за голоси за карти гравців (максимум 3)
  const bonusPoints = {};
  Object.entries(votes).forEach(([voterId, vote]) => {
    console.log("Підрахунок бонусних балів (але не більше 3)");
    // Якщо віддано два голоси за одну карту, то нараховується лише один бал:
    const votedCardIds =
      vote.firstVotedCardId === vote.secondVotedCardId
        ? [vote.firstVotedCardId]
        : [vote.firstVotedCardId, vote.secondVotedCardId];

    // Беру проголосовані гравцем карти...
    votedCardIds.forEach(cardId => {
      if (cardId) {
        // ...і шукаю їх на столі
        const card = cardsOnTable.find(c => c._id === cardId);
        // Голосувати за свою карту не можна:
        if (card && card.ownerId !== voterId) {
          // Якщо проголосована гравцем карта знайдена на столі і це не його карта, то додатковий бонусний бал власнику карти:
          bonusPoints[card.ownerId] = (bonusPoints[card.ownerId] || 0) + 1;
          // console.log(`Гравець ${card.ownerId} отримує +1 бал у {bonusPoints}`);
        }
      }
    });
  });

  Object.entries(bonusPoints).forEach(([ownerId, points]) => {
    if (ownerId !== storytellerId) {
      // console.log(
      //   `Гравець ${ownerId} отримав додатково ${points} балів (але зарахується не більше 3)`,
      // );

      updatedScores[ownerId] += Math.min(points, 3); // гравець може отримати максимум 3 бали, навіть якщо його points більше.
      // console.log(`Тепер у гравця ${ownerId} ${updatedScores[ownerId]} балів`);
    }
  });

  // * Додаткове правило Odyssey для 7-12 гравців без isSingleCardMode
  if (playerCount > 6 && !isSingleCardMode) {
    console.log("+1бал, якщо 2 зірки на одну карту і вона була вгадана");
    // Додатковий бал за два голоси за правильну карту
    Object.entries(votes).forEach(([voterId, vote]) => {
      if (
        vote.firstVotedCardId === vote.secondVotedCardId &&
        vote.firstVotedCardId === storytellerCardId &&
        voterId !== storytellerId
      ) {
        // console.log(
        //   `Правила Одісеї: гравець ${voterId} отримує +1 бал за дві зірки`,
        // );
        updatedScores[voterId] += 1;
      }
    });
  }

  return updatedScores;
}
