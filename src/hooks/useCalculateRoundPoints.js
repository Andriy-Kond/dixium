import { useSelector } from "react-redux";
import {
  selectIsSingleCardMode,
  selectLocalGame,
  selectScores,
  selectStorytellerId,
  selectVotes,
} from "redux/selectors.js";

// Ця функція враховує всі правила, включаючи бонуси за введення інших в оману:
export const useCalculateRoundPoints = (gameId, selectedCardId) => {
  const currentGame = useSelector(selectLocalGame(gameId));

  const storytellerId = useSelector(selectStorytellerId(gameId));
  const isSingleCardMode = useSelector(selectIsSingleCardMode(gameId));
  const scores = useSelector(selectScores(gameId));
  // scores: { type: Map, of: Number }, // Бали гравців { playerId: score }
  const votes = useSelector(selectVotes(gameId)); // { cardId: кількість голосів }
  // votes: { type: Map, of: String }, // Голоси гравців { playerId: cardId }

  const points = {};
  const votesPerCard = {};
  let correctVotes = 0;

  // кількість гравців
  const playersQty = currentGame.players.length;

  // Чи грають гравці двома картами (isSingleCardMode === false or playersQty === 3)
  const twoCardsMode = !isSingleCardMode || playersQty === 3;

  // Ініціалізуємо всіх гравців з нульовими очками за раунд
  currentGame.players.forEach(player => (points[player._id] = 0));

  // Збираємо дані про голосування
  Object.entries(scores).forEach(([playerId, votedCardId]) => {
    votesPerCard[votedCardId] = (votesPerCard[votedCardId] || 0) + 1;

    if (votedCardId === selectedCardId) {
      correctVotes++; // Гравець правильно вгадав карту ведучого
    }
  });

  const totalPlayers = currentGame.players.length;

  // Розрахунок очок ведучому (Storyteller)
  if (correctVotes === 0 || correctVotes === totalPlayers - 1) {
    scores[storytellerId] += 0; // Якщо всі або ніхто не вгадав, ведучий отримує 0
  } else {
    scores[storytellerId] += 3; // В іншому випадку +3 очки ведучому
  }

  // Розрахунок очок гравцям
  currentGame.players.forEach(player => {
    if (player.id !== storytellerId) {
      const votedCardId = votes[player.id];

      if (votedCardId === selectedCardId) {
        scores[player.id] += 3; // Гравець вгадав карту ведучого
      }

      // Додаємо бонус за введення інших в оману
      if (votesPerCard[player.ownCard]) {
        scores[player.id] += votesPerCard[player.ownCard];
      }
    }
  });

  return scores;
};

// 1. Players Qty: 4-12
// - IF: All goal or nobody goal:
//   all get 2 points except storyteller
// - ELSE: In any other way:
//   storyteller and goal players get by 3 points.
// - In any way: each player get 1 additional point if voted for him card (but not more than 3 points maximum)

// 2. Players Qty: 3
//   Players hand - 7 cards instead 6
//   Players (except storyteller) discards by 2 cards instead 1 (5 cards on game field for 3 players)

// 3. Players Qty: 7-12 (can be on or off as option)
// Players can play by 1 or 2 cards.
// If player vote for 1 cards only he get 1 additional point (4 points instead 3)
