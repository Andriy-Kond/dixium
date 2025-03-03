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
import {
  selectCurrentDeckId,
  selectPlayers,
  selectUserCredentials,
} from "redux/selectors.js";
import Button from "common/components/Button";
import socket from "servises/socket.js";
import { shuffleDeck } from "features/utils/shuffleDeck.js";

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

  const players = useSelector(selectPlayers);

  const createNewGame = async () => {
    const game = {
      deck: shuffleDeck(currentDeck.cards),
      players,
      isGameStarted: false,
      hostPlayerId: userCredentials._id,
      hostPlayerName: userCredentials.name,
    };

    socket.emit("createGame", game);
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
