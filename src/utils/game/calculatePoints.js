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
    console.log(" бали гравців на початку updatedScores:::", updatedScores);
  });

  // Знаходимо карту оповідача
  const storytellerCard = cardsOnTable.find(
    card => card.ownerId === storytellerId,
  );
  const storytellerCardId = storytellerCard._id;

  // Підрахунок кількості голосів за карту оповідача
  let votesForStorytellerCard = 0;
  Object.entries(votes).forEach(([voterId, vote]) => {
    if (vote.firstVotedCardId === storytellerCardId) {
      console.log(
        "голос за карту оповідача першою зіркою - votesForStorytellerCard++",
      );
      votesForStorytellerCard++;
    }
    if (vote.secondVotedCardId === storytellerCardId) {
      console.log(
        "голос за карту оповідача другою зіркою - votesForStorytellerCard++",
      );
      votesForStorytellerCard++;
    }
  });

  // Логіка підрахунку балів
  const allVotedForStoryteller = votesForStorytellerCard === playerCount - 1; // -1, бо оповідач не голосує за себе
  const noneVotedForStoryteller = votesForStorytellerCard === 0;

  console.log(" playerCount:::", playerCount);
  console.log(" votesForStorytellerCard:::", votesForStorytellerCard);

  // * Правила для 3 гравців, та стандартні правила для 4-6 гравців або 7-12 з isSingleCardMode
  if (allVotedForStoryteller || noneVotedForStoryteller) {
    console.log(
      "або ніхто не вгадав гру, або всі вгадали - всім по 2 бали, оповідачу - 0",
    );
    updatedScores[storytellerId] = 0; // Оповідач отримує 0
    console.log(" Оповідач отримує 0 балів updatedScores:::", updatedScores);

    gamePlayers.forEach(player => {
      if (player._id !== storytellerId) {
        console.log(" storytellerId:::", storytellerId);
        console.log("гравець отримає 2 бали:>> ", player._id);
        updatedScores[player._id] += 2;
      } // Інші по 2
    });
  } else {
    console.log(
      "хтось вгадав карту оповідача, але не всі - оповідачу - 3 бали, всім вгадавшим теж по 3 бали",
    );
    updatedScores[storytellerId] += 3; // Оповідач отримує 3
    console.log("Оповідач отримує 3 бали updatedScores:::", updatedScores);

    Object.entries(votes).forEach(([voterId, vote]) => {
      if (
        voterId !== storytellerId &&
        (vote.firstVotedCardId === storytellerCardId ||
          vote.secondVotedCardId === storytellerCardId)
      ) {
        updatedScores[voterId] += 3; // Вгадали карту оповідача - 3 бали
        console.log("гравець  отримає 3 бали :>> ", voterId);

        console.log(
          " гравець  отримає 3 бали >> updatedScores:::",
          updatedScores,
        );
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
        if (card && card.ownerId !== voterId) {
          console.log("карта на столі знайдена і вона не моя");
          // Якщо проголосована гравцем карта знайдена на столі і це не його карта, то додатковий бонусний бал власнику карти:

          bonusPoints[card.ownerId] = (bonusPoints[card.ownerId] || 0) + 1;
        }
      }
    });
  });

  Object.entries(bonusPoints).forEach(([playerId, points]) => {
    if (playerId !== storytellerId) {
      console.log(
        "points, які отримані гравцем за карту, але не більше 3 :>> ",
        points,
      );
      updatedScores[playerId] += Math.min(points, 3); // гравець може отримати максимум 3 бали, навіть якщо його points більше.
    }
  });

  // * Додаткове правило Odyssey для 7-12 гравців без isSingleCardMode
  if (playerCount >= 7 && !isSingleCardMode) {
    console.log(
      "правіла одісеї - +1бал, якщо дві зірки на одну карту і вона була задана оповідачем",
    );
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
