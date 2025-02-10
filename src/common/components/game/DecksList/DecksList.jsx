import {
  useGetAllDecksQuery,
  useGetCurrentDeckQuery,
} from "features/game/gameApi.js";
import css from "./DecksList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentDeckId,
  setIsCreatingGame,
} from "features/game/gameSlice.js";
import { selectGameDeckId } from "app/selectors.js";
import Button from "common/components/Button/Button.jsx";

export default function DecksList() {
  const dispatch = useDispatch();

  const gameDeckId = useSelector(selectGameDeckId);
  console.log("DecksList >> gameDeckId:::", gameDeckId);

  const { data: allDecks } = useGetAllDecksQuery();
  console.log("DecksList >> allDecks:::", allDecks);

  const { data: currentDeck } = useGetCurrentDeckQuery(gameDeckId, {
    skip: !gameDeckId,
  });
  console.log("DecksList >> currentDeck:::", currentDeck);

  const pullDeck = deckId => {
    dispatch(setCurrentDeckId(deckId));
  };

  const selectDeck = () => {
    dispatch(setIsCreatingGame(false));
  };

  const buttonText = "Create game";

  return (
    <div className={css.container}>
      <p className={css.deckTitle}>Select your deck</p>
      <ul className={css.deckList}>
        {allDecks?.map(deck => {
          return (
            <li className={css.deck} key={deck._id}>
              <Button
                onClick={() => {
                  pullDeck(deck._id);
                }}
                buttonText={`Deck: ${deck.name}`}
              />
            </li>
          );
        })}
      </ul>

      {gameDeckId && (
        <div>
          <h3>Selected Deck: {currentDeck?.name}</h3>
          <ul className={css.currentDeck}>
            {currentDeck?.cards?.map(card => (
              <li className={css.card} key={card._id}>
                {card.name}
                <img className={css.img} src={card.url} alt="card" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={css.bottomBar}>
        <Button onClick={selectDeck} buttonText={buttonText} />
      </div>
    </div>
  );
}
