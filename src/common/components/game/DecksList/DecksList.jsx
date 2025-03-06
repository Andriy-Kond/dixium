import {
  useGetAllDecksQuery,
  useGetCurrentDeckQuery,
} from "redux/game/gameApi.js";
import css from "./DecksList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentDeckId, setIsCreatingGame } from "redux/game/gameSlice.js";
import { selectCurrentDeckId, selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button";
import socket from "servises/socket.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";

export default function DecksList() {
  const dispatch = useDispatch();
  const currentDeckId = useSelector(selectCurrentDeckId);
  const userCredentials = useSelector(selectUserCredentials);
  const { data: allDecks } = useGetAllDecksQuery();
  const { data: currentDeck } = useGetCurrentDeckQuery(currentDeckId, {
    skip: !currentDeckId,
  });

  const pullDeck = deckId => {
    dispatch(setCurrentDeckId(deckId));
  };

  const createNewGame = async () => {
    const gameData = {
      deck: shuffleDeck(currentDeck.cards),

      hostPlayerId: userCredentials._id,
      hostPlayerName: userCredentials.name,
    };

    socket.emit("createGame", { gameData });
    dispatch(setIsCreatingGame(false));
    dispatch(setCurrentDeckId(null));
  };

  const toPreviousPage = () => {
    dispatch(setIsCreatingGame(false));
  };

  return (
    <div className={css.container}>
      <p className={css.deckTitle}>Select your deck</p>
      <ul className={css.deckList}>
        {allDecks?.map(deck => (
          <li className={css.deck} key={deck._id}>
            <Button
              onClick={() => {
                pullDeck(currentDeckId === deck._id ? null : deck._id);
              }}
              btnText={`Deck: ${deck.name}`}
              btnStyle={["twoBtnsInRow"]}
              localClassName={currentDeck?._id === deck._id && css.btnActive}
            />

            <ul
              className={`${css.currentDeck} ${
                currentDeckId === deck._id && css.show
              }`}>
              {deck.cards?.map(card => (
                <li className={css.card} key={card._id}>
                  <img className={css.img} src={card.url} alt="card" />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className={css.bottomBar}>
        <Button
          onClick={toPreviousPage}
          btnText={"Back"}
          btnStyle={["twoBtnsInRow"]}
        />
        <Button
          onClick={createNewGame}
          btnText={"Select deck"}
          btnStyle={["twoBtnsInRow"]}
          disabled={!currentDeck}
        />
      </div>
    </div>
  );
}
