import {
  useCreateGameMutation,
  useGetAllDecksQuery,
  useGetCurrentDeckQuery,
} from "features/game/gameApi.js";
import css from "./DecksList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentDeckId,
  setIsCreatingGame,
} from "features/game/gameSlice.js";
import {
  // selectedDeck,
  selectGameDeckId,
  // selectGameId,
  selectPlayers,
} from "app/selectors.js";
import Button from "common/components/Button";
import { nanoid } from "@reduxjs/toolkit";

export default function DecksList() {
  const dispatch = useDispatch();

  const gameDeckId = useSelector(selectGameDeckId);

  const { data: allDecks } = useGetAllDecksQuery();

  const { data: currentDeck } = useGetCurrentDeckQuery(gameDeckId, {
    skip: !gameDeckId,
  });
  console.log("DecksList >> currentDeck:::", currentDeck);

  const [createGame] = useCreateGameMutation();

  const pullDeck = deckId => {
    dispatch(setCurrentDeckId(deckId));
  };
  // const gameId = useSelector(selectGameId);
  // const deck = useSelector(selectedDeck);
  const players = useSelector(selectPlayers);

  const selectDeck = async () => {
    const game = {
      gameId: nanoid(),
      deck: currentDeck,
      players,
      startGame: true,
      // gameCreator: userID
    };

    const result = await createGame(game);
    dispatch(setIsCreatingGame(false));
  };

  const btnText = "Select deck";

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
                btnText={`Deck: ${deck.name}`}
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
        <Button onClick={selectDeck} btnText={btnText} />
      </div>
    </div>
  );
}
