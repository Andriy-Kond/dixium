import {
  useGetAllDecksQuery,
  useGetCurrentDeckQuery,
} from "redux/game/gameApi.js";
import { useTranslation } from "react-i18next";
import css from "./DecksList.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentDeckId, setIsCreatingGame } from "redux/game/gameSlice.js";
import { selectCurrentDeckId, selectUserCredentials } from "redux/selectors.js";
import Button from "common/components/ui/Button";
import socket from "services/socket.js";
import { shuffleDeck } from "utils/game/shuffleDeck.js";
import { LOBBY } from "utils/generals/constants.js";

export default function DecksList() {
  const { t } = useTranslation();
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
      gameStatus: LOBBY,
      isGameRunning: false,
      isGameStarted: false,
      isFirstTurn: false,
      isSingleCardMode: false,
      hostPlayerId: userCredentials._id,
      hostPlayerName: userCredentials.name,
      storytellerId: null,
      currentRound: 0,
      cardsOnTable: [],
      votes: {},
      scores: {},
      players: [],
      deck: shuffleDeck(currentDeck.cards),
      discardPile: [],
      roundResults: [],
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
      <p className={css.deckTitle}>Select deck</p>
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
