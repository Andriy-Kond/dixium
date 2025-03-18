// Функція підрахунку очок в Dixit
// Ця функція враховує всі правила, включаючи бонуси за введення інших в оману:
export const calculatePoints = (
  players,
  storytellerId,
  selectedCardId,
  votes,
) => {
  const points = {};

  // Ініціалізуємо всіх гравців з нульовими очками за раунд
  players.forEach(player => (points[player.id] = 0));

  // Збираємо дані про голосування
  const votesPerCard = {}; // { cardId: кількість голосів }
  let correctVotes = 0;

  Object.entries(votes).forEach(([playerId, votedCardId]) => {
    votesPerCard[votedCardId] = (votesPerCard[votedCardId] || 0) + 1;

    if (votedCardId === selectedCardId) {
      correctVotes++; // Гравець правильно вгадав карту ведучого
    }
  });

  const totalPlayers = players.length;

  // Розрахунок очок ведучому (Storyteller)
  if (correctVotes === 0 || correctVotes === totalPlayers - 1) {
    points[storytellerId] += 0; // Якщо всі або ніхто не вгадав, ведучий отримує 0
  } else {
    points[storytellerId] += 3; // В іншому випадку +3 очки ведучому
  }

  // Розрахунок очок гравцям
  players.forEach(player => {
    if (player.id !== storytellerId) {
      const votedCardId = votes[player.id];

      if (votedCardId === selectedCardId) {
        points[player.id] += 3; // Гравець вгадав карту ведучого
      }

      // Додаємо бонус за введення інших в оману
      if (votesPerCard[player.ownCard]) {
        points[player.id] += votesPerCard[player.ownCard];
      }
    }
  });

  return points;
};

// Приклад використання
const players = [
  { id: "user1", name: "Alex", ownCard: "cardA" },
  { id: "user2", name: "Masha", ownCard: "cardB" },
  { id: "user3", name: "Ivan", ownCard: "cardC" },
  { id: "user4", name: "Olya", ownCard: "cardD" },
];

const storytellerId = "user1"; // Ведучий
const selectedCardId = "cardA"; // Карта ведучого
const votes = { user2: "cardA", user3: "cardB", user4: "cardB" };
// В цьому прикладі:
//     User2 вгадав карту ведучого → +3 бали
//     User3 і User4 вибрали карту User3 → User3 отримує +2 бонусних бали
//     User1 (ведучий) отримує +3, бо не всі і не ніхто не вгадали
console.log(calculatePoints(players, storytellerId, selectedCardId, votes));

// Формула для ведучого:
const getStorytellerPoints = (correctVotes, totalPlayers) => {
  return correctVotes === 0 || correctVotes === totalPlayers - 1 ? 0 : 3;
};

// Формула для гравця:
const getPlayerPoints = (isCorrect, receivedVotes) => {
  return (isCorrect ? 3 : 0) + receivedVotes;
};

// votes: Об’єкт, де ключ — ID гравця, значення — ID карти, за яку він проголосував.
// submitVote: (state, action) => {
//     state.game.votes[action.payload.playerId] = action.payload.cardId;
//   },
// scores: Бали гравців для відображення результатів.
// state.game.scores = action.payload.scores;
