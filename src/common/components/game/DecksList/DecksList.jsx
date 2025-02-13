import {
  useCreateGameMutation,
  useGetAllDecksQuery,
  useGetCurrentDeckQuery,
} from "features/game/gameApi.js";
import css from "./DecksList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  addPlayer,
  setCurrentDeckId,
  setIsCreatingGame,
} from "features/game/gameSlice.js";
import {
  selectGameDeckId,
  selectPlayers,
  selectUserCredentials,
} from "app/selectors.js";
import Button from "common/components/Button";

export default function DecksList() {
  const dispatch = useDispatch();

  const gameDeckId = useSelector(selectGameDeckId);
  const userCredentials = useSelector(selectUserCredentials);

  const { data: allDecks } = useGetAllDecksQuery();
  const { data: currentDeck } = useGetCurrentDeckQuery(gameDeckId, {
    skip: !gameDeckId,
  });

  const [createGame] = useCreateGameMutation();

  const pullDeck = deckId => {
    dispatch(setCurrentDeckId(deckId));
  };

  const players = useSelector(selectPlayers);

  const selectDeck = async () => {
    console.log("DecksList >> currentDeck:::", currentDeck.cards);
    const game = {
      deck: currentDeck.cards,
      players,
      isGameStarted: false,
      hostPlayer: userCredentials.userId,
    };

    const result = await createGame(game);
    console.log("selectDeck >> result:::", result);
    dispatch(setIsCreatingGame(false));
  };

  const toPreviousPage = () => {
    dispatch(setIsCreatingGame(false));
  };

  const btnTextSelect = "Select deck";
  const btnTextBack = "Back";

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
                <p>{card.public_id}</p>
                <img className={css.img} src={card.url} alt="card" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={css.bottomBar}>
        <Button onClick={toPreviousPage} btnText={btnTextBack} />
        <Button onClick={selectDeck} btnText={btnTextSelect} />
      </div>
    </div>
  );
}
