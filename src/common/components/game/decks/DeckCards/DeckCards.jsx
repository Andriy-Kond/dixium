import ImgGen from "common/components/ui/ImgGen/index.js";
import { useParams } from "react-router-dom";
import { useGetAllDecksQuery } from "redux/game/gameApi.js";
import css from "./DeckCards.module.scss";

export default function DeckCards() {
  const { deckId } = useParams();
  const { data: allDecks, isLoading } = useGetAllDecksQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const deck = allDecks?.find(deck => deck._id === deckId);

  if (!deck) {
    return <div>Deck not found</div>;
  }

  return (
    <>
      <h1>Deck Cards</h1>
      <ul className={css.currentDeck}>
        {deck.cards?.map(card => (
          <li className={css.card} key={card._id}>
            <ImgGen className={css.img} publicId={card.public_id} />
          </li>
        ))}
      </ul>
    </>
  );
}
