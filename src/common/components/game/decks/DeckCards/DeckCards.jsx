export default function DeckCards(deck) {
  return (
    <>
      <h1>Deck Cards</h1>
      {deck?.cards?.map(card => {
        return <img src="to-card" alt="card" />;
      })}
    </>
  );
}
