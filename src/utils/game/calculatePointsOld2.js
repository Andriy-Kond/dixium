// Перетворюємо votes у зручніший формат для аналізу
const voteCountByCard = new Map(); // { cardId: кількість голосів }
const votesByPlayer = new Map(); // { playerId: [cardId1, cardId2] }
const votesPerCard = {};

export function calculatePoints({
  gamePlayers, // Масив гравців
  storytellerId, // ID оповідача цього раунду
  cardsOnTable, // Карти на столі
  votes, // Голоси гравців у форматі Map { playerId: { firstVotedCardId, secondVotedCardId } }
  scores, // Поточні бали гравців у форматі Map { playerId: score }
  isSingleCardMode, // Режим гри (true - стандартні правила, false - Odyssey для >6 гравців)
}) {
  const playerCount = gamePlayers.length;

  if (playerCount === 3) {
  }

  if (playerCount > 3) {
  }

  if (playerCount > 6 && !isSingleCardMode) {
  }

  // const newScores = new Map(scores); // Копіюємо поточні бали для оновлення
  const newScores = { ...scores }; // Копіюємо поточні бали для оновлення

  // Визначаємо карту оповідача
  const storytellerCard = cardsOnTable.find(
    card => card.owner === storytellerId,
  );
  const storytellerCardId = storytellerCard._id;

  const updatedVotes = { ...votes };
  Object.entries(updatedVotes).forEach(([playerId, votes]) => {
    const firstVote = votes.firstVotedCardId;
    const secondVote = votes.secondVotedCardId;

    const playerVotes = [firstVote];
    if (secondVote) playerVotes.push(secondVote);

    votesByPlayer.set(playerId, playerVotes); // ??? нащо?

    playerVotes.forEach(cardId => {
      if (cardId) {
        // voteCountByCard.set(cardId, (voteCountByCard.get(cardId) || 0) + 1);
        votesPerCard[cardId] = (votesPerCard[cardId] || 0) + 1;
      }
    });
  });

  // Кількість гравців, які вгадали карту оповідача
  const correctGuesses = Array.from(votes.entries()).filter(
    ([playerId, vote]) => {
      return (
        playerId !== storytellerId &&
        (vote.get("firstVotedCardId") === storytellerCardId ||
          vote.get("secondVotedCardId") === storytellerCardId)
      );
    },
  ).length;

  // Логіка підрахунку балів залежно від кількості гравців
  if (playerCount === 3) {
    // Правила для 3 гравців (2 карти на стіл, голосування за 1)
    calculateThreePlayerScoring({
      newScores,
      storytellerId,
      correctGuesses,
      playerCount,
      votesByPlayer,
      cardsOnTable,
    });
  } else if (playerCount >= 4 && playerCount <= 12) {
    // Стандартні правила для 4-12 гравців
    calculateStandardScoring({
      newScores,
      storytellerId,
      correctGuesses,
      playerCount,
      votesByPlayer,
      cardsOnTable,
    });
  } else if (playerCount > 12) {
    // Правила для >12 гравців
    if (isSingleCardMode) {
      calculateStandardScoring({
        newScores,
        storytellerId,
        correctGuesses,
        playerCount,
        votesByPlayer,
        cardsOnTable,
      });
    } else {
      calculateOdysseyScoring({
        newScores,
        storytellerId,
        correctGuesses,
        playerCount,
        votesByPlayer,
        cardsOnTable,
        storytellerCardId,
      });
    }
  }

  return newScores; // Повертаємо оновлені бали
}

// Функція для стандартних правил (4-12 гравців або isSingleCardMode)
function calculateStandardScoring({
  newScores,
  storytellerId,
  correctGuesses,
  playerCount,
  votesByPlayer,
  cardsOnTable,
  players,
  storytellerCardId,
}) {
  const allGuessed = correctGuesses === playerCount - 1;
  const noneGuessed = correctGuesses === 0;

  // Основні бали
  if (allGuessed || noneGuessed) {
    newScores.set(storytellerId, (newScores.get(storytellerId) || 0) + 0);
    players.forEach(player => {
      if (player._id !== storytellerId) {
        newScores.set(player._id, (newScores.get(player._id) || 0) + 2);
      }
    });
  } else {
    newScores.set(storytellerId, (newScores.get(storytellerId) || 0) + 3);
    votesByPlayer.forEach((votedCards, playerId) => {
      if (
        playerId !== storytellerId &&
        votedCards.includes(storytellerCardId)
      ) {
        newScores.set(playerId, (newScores.get(playerId) || 0) + 3);
      }
    });
  }

  // Додаткові бали за голоси на картах гравців
  cardsOnTable.forEach(card => {
    const ownerId = card.owner;
    if (ownerId !== storytellerId) {
      const votesForCard = voteCountByCard.get(card.public_id) || 0;
      const bonusPoints = Math.min(votesForCard, 3); // Максимум 3 бали
      newScores.set(ownerId, (newScores.get(ownerId) || 0) + bonusPoints);
    }
  });
}

// Функція для 3 гравців
function calculateThreePlayerScoring({
  newScores,
  storytellerId,
  correctGuesses,
  playerCount,
  votesByPlayer,
  cardsOnTable,
}) {
  calculateStandardScoring({
    newScores,
    storytellerId,
    correctGuesses,
    playerCount,
    votesByPlayer,
    cardsOnTable,
  });
}

// Функція для правил Odyssey (>12 гравців, якщо !isSingleCardMode)
function calculateOdysseyScoring({
  newScores,
  storytellerId,
  correctGuesses,
  playerCount,
  votesByPlayer,
  cardsOnTable,
  storytellerCardId,
  gamePlayers,
}) {
  const allGuessed = correctGuesses === playerCount - 1;
  const noneGuessed = correctGuesses === 0;

  // Основні бали
  if (allGuessed || noneGuessed) {
    newScores.set(storytellerId, (newScores.get(storytellerId) || 0) + 0);
    gamePlayers.forEach(player => {
      if (player._id !== storytellerId) {
        newScores.set(player._id, (newScores.get(player._id) || 0) + 2);
      }
    });
  } else {
    newScores.set(storytellerId, (newScores.get(storytellerId) || 0) + 3);
    votesByPlayer.forEach((votedCards, playerId) => {
      if (
        playerId !== storytellerId &&
        votedCards.includes(storytellerCardId)
      ) {
        newScores.set(playerId, (newScores.get(playerId) || 0) + 3);
        // Додатковий бал за два голоси за карту оповідача
        if (
          votedCards[0] === storytellerCardId &&
          votedCards[1] === storytellerCardId
        ) {
          newScores.set(playerId, (newScores.get(playerId) || 0) + 1);
        }
      }
    });
  }

  // Додаткові бали за голоси на картах гравців
  cardsOnTable.forEach(card => {
    const ownerId = card.owner;
    if (ownerId !== storytellerId) {
      const votesForCard = voteCountByCard.get(card.public_id) || 0;
      const bonusPoints = Math.min(votesForCard, 3); // Максимум 3 бали
      newScores.set(ownerId, (newScores.get(ownerId) || 0) + bonusPoints);
    }
  });
}
