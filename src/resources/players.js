const playersCount = 5;
export const players = Array.from({ length: playersCount }, (_, idx) => ({
  id: idx + 1,
  player: `player${idx + 1}`,
  email: `player${idx + 1}@m.com`,
  hand: [],
  playerAvatar: "https://loremflickr.com/640/480/animals",
}));

export const players_02 = [
  {
    id: 1,
    player: "player1",
    email: "player1@m.com",
    hand: [],
  },
  {
    id: 2,
    player: "player2",
    email: "player2@m.com",
    hand: [],
    playerAvatar: "https://loremflickr.com/640/480/animals",
  },
];
