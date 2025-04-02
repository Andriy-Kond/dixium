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
import { getImageUrl } from "utils/generals/getImageUrl.js";
import ImbGen from "common/components/game/ImbGen";

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
      <p className={css.deckTitle}>{t("select_deck")}</p>
      <ul className={css.deckList}>
        {allDecks?.map(deck => (
          <li className={css.deck} key={deck._id}>
            <Button
              onClick={() => {
                pullDeck(currentDeckId === deck._id ? null : deck._id);
              }}
              // btnText={`Deck: ${deck.name}`}
              btnText={t("deck", { name: deck.name })}
              btnStyle={["twoBtnsInRow"]}
              localClassName={currentDeck?._id === deck._id && css.btnActive}
            />

            <ul
              className={`${css.currentDeck} ${
                currentDeckId === deck._id && css.show
              }`}>
              {deck.cards?.map(card => (
                <li className={css.card} key={card._id}>
                  <ImbGen className={css.img} publicId={card.public_id} />
                  {/* <img
                    className={css.img}
                    alt="card"
                    src={getImageUrl({ publicId: card.public_id, width: 100 })} // Базовий розмір
                    // Доступні розміри зображень:
                    srcSet={`${getImageUrl({
                      publicId: card.public_id,
                      width: 100,
                    })} 100w,            
                    ${getImageUrl({
                      publicId: card.public_id,
                      width: 200,
                    })} 200w,            
                    ${getImageUrl({
                      publicId: card.public_id,
                      width: 400,
                    })} 400w`}
                    // підказує браузеру, який розмір зображення потрібен залежно від ширини в'юпорту
                    sizes="(max-width: 320px) 100px, (max-width: 768px) 200px, 400px"
                  /> */}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className={css.bottomBar}>
        <Button
          onClick={toPreviousPage}
          btnText={t("back")}
          btnStyle={["twoBtnsInRow"]}
        />
        <Button
          onClick={createNewGame}
          btnText={t("select_deck")}
          btnStyle={["twoBtnsInRow"]}
          disabled={!currentDeck}
        />
      </div>
    </div>
  );
}
