import css from "./DeckCards.module.scss";

export default function DeckCards(deck) {
  return (
    <>
      {deck.map(card => {
        <img src="to-card" alt="card" />;
      })}
    </>
  );
}
