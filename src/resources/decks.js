export const deck = Array.from({ length: 64 }, (_, idx) => ({
  id: idx + 1,
  card: `Card ${idx + 1}`,
  cardPlayed: false,
  cardLink: "https://loremflickr.com/640/480/animals",
}));

export const deck_02 = [
  {
    id: 1,
    card: "card 01",
    cardPlayed: false,
    cardLink: "https://loremflickr.com/640/480/animals",
  },

  {
    id: 2,
    card: "card 02",
    cardPlayed: false,
    cardLink: "https://loremflickr.com/640/480/animals",
  },
];
