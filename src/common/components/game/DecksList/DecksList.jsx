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
  selectDeckId,
  selectPlayers,
  selectUserCredentials,
} from "app/selectors.js";
import Button from "common/components/Button";
import socket from "socket.js";

export default function DecksList() {
  const dispatch = useDispatch();

  const DeckId = useSelector(selectDeckId);
  const userCredentials = useSelector(selectUserCredentials);

  const { data: allDecks } = useGetAllDecksQuery();
  const { data: currentDeck } = useGetCurrentDeckQuery(DeckId, {
    skip: !DeckId,
  });

  const pullDeck = deckId => {
    dispatch(setCurrentDeckId(deckId));
  };

  const players = useSelector(selectPlayers);

  const createGameBasedOnSelectedDeck = async () => {
    const game = {
      deck: currentDeck.cards,
      players,
      isGameStarted: false,
      hostPlayerId: userCredentials.userId,
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
        {allDecks?.map(deck => {
          return (
            <li className={css.deck} key={deck._id}>
              <Button
                onClick={() => {
                  pullDeck(deck._id);
                }}
                btnText={`Deck: ${deck.name}`}
                btnStyle={["twoBtnsInRow"]}
                localClassName={currentDeck?._id === deck._id && css.btnActive}
              />
            </li>
          );
        })}
      </ul>

      {DeckId && (
        <div>
          <ul className={css.currentDeck}>
            {currentDeck?.cards?.map(card => (
              <li className={css.card} key={card._id}>
                <img className={css.img} src={card.url} alt="card" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={css.bottomBar}>
        <Button
          onClick={toPreviousPage}
          btnText={"Back"}
          btnStyle={["twoBtnsInRow"]}
        />
        <Button
          onClick={createGameBasedOnSelectedDeck}
          btnText={"Select deck"}
          btnStyle={["twoBtnsInRow"]}
          disabled={!currentDeck}
        />
      </div>
    </div>
  );
}
