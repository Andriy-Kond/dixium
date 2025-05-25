import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useGetAllDecksQuery } from "redux/game/gameApi.js";
import css from "./SelectDecks.module.scss";
// import { setCurrentDeckId } from "redux/game/gameSlice.js";
// import Button from "common/components/ui/Button/index.js";
// import ImgGen from "common/components/ui/ImgGen/index.js";

import { useState } from "react";
import {
  CHECKED_NONE,
  CHECKED_ALL,
  CHECKED_USER,
} from "utils/generals/constants.js";
import {
  deleteCardsFromDeck,
  setGameDeck,
} from "redux/game/localPersonalSlice.js";
import { selectLocalGame } from "redux/selectors.js";

export default function SelectDecks() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { gameId } = useParams();
  // const dispatch = useDispatch();
  const currentGame = useSelector(selectLocalGame(gameId));

  // const currentDeckId = useSelector(selectCurrentDeckId);

  const { data: allDecks } = useGetAllDecksQuery();
  // const { data: currentDeck } = useGetCurrentDeckQuery(currentDeckId, {
  //   skip: !currentDeckId,
  // });

  // Стан для відстеження обраних колод
  const [selectedDeckIds, setSelectedDeckIds] = useState([]);

  // Стан для збереження вибору користувача
  const [userSelectedDeckIds, setUserSelectedDeckIds] = useState([]);

  // Стан для відстеження циклу (0: CHECKED_ALL, 1: CHECKED_NONE, 2: CHECKED_USER)
  const [cycleState, setCycleState] = useState(0);

  // Визначення стану загального чекбокса
  const getSelectAllState = () => {
    if (selectedDeckIds.length === 0) return CHECKED_NONE;
    if (selectedDeckIds.length === allDecks?.length) return CHECKED_ALL;
    return CHECKED_USER;
  };

  const selectAllState = getSelectAllState();

  // Обробка кліку на загальний чекбокс
  const handleSelectAllDecks = () => {
    const hasUserSelection =
      userSelectedDeckIds.length > 0 &&
      userSelectedDeckIds.length < (allDecks?.length || 0);

    if (!hasUserSelection) {
      // Просте перемикання для випадків, коли немає часткового вибору
      if (selectAllState !== CHECKED_ALL) {
        // Обрати всі колоди
        const allDeckIds = allDecks.map(deck => deck._id);
        setSelectedDeckIds(allDeckIds);
        const allCards = allDecks.flatMap(deck => deck.cards);
        dispatch(setGameDeck({ gameId, cards: allCards }));
        setCycleState(0);
      } else {
        // Зняти вибір з усіх колод
        setSelectedDeckIds([]);
        dispatch(setGameDeck({ gameId, cards: [] }));
        setCycleState(1);
      }
    } else {
      // Цикл для часткового вибору: CHECKED_ALL -> CHECKED_NONE -> CHECKED_USER
      const nextCycleState = (cycleState + 1) % 3;
      // console.log(" handleSelectAllDecks >> cycleState:::", cycleState);
      // console.log(" handleSelectAllDecks >> nextCycleState:::", nextCycleState);

      if (nextCycleState === 0) {
        // CHECKED_ALL: Обрати всі колоди
        const allDeckIds = allDecks.map(deck => deck._id);
        setSelectedDeckIds(allDeckIds);
        const allCards = allDecks.flatMap(deck => deck.cards);
        dispatch(setGameDeck({ gameId, cards: allCards }));
      } else if (nextCycleState === 1) {
        // CHECKED_NONE: Зняти вибір з усіх колод
        setSelectedDeckIds([]);
        dispatch(setGameDeck({ gameId, cards: [] }));
      } else {
        // CHECKED_USER: Повернути до вибору користувача
        setSelectedDeckIds(userSelectedDeckIds);
        const userSelectedDecks = allDecks.filter(deck =>
          userSelectedDeckIds.includes(deck._id),
        );
        const userSelectedCards = userSelectedDecks.flatMap(deck => deck.cards);
        dispatch(setGameDeck({ gameId, cards: userSelectedCards }));
      }

      setCycleState(nextCycleState);
    }
  };

  // Обробка кліку на окремий чекбокс
  const handleSelectDeck = deck => {
    // console.log("cycleState:::", cycleState);
    const isSelected = selectedDeckIds.includes(deck._id);
    let newSelectedDeckIds;
    let newUserSelectedDeckIds;

    if (isSelected) {
      // Видалити колоду
      newSelectedDeckIds = selectedDeckIds.filter(id => id !== deck._id);
      newUserSelectedDeckIds = userSelectedDeckIds.filter(
        id => id !== deck._id,
      );
      setSelectedDeckIds(newSelectedDeckIds);
      setUserSelectedDeckIds(newUserSelectedDeckIds);
      dispatch(deleteCardsFromDeck({ gameId, removingCards: deck.cards }));
    } else {
      // Додати колоду
      newSelectedDeckIds = [...selectedDeckIds, deck._id];
      newUserSelectedDeckIds = [...userSelectedDeckIds, deck._id];
      setSelectedDeckIds(newSelectedDeckIds);
      setUserSelectedDeckIds(newUserSelectedDeckIds);
      // Додаємо тільки нові карти, уникаючи дублювання
      const newCards = deck.cards.filter(
        card =>
          !currentGame.deck.some(existingCard => existingCard._id === card._id),
      );
      dispatch(
        setGameDeck({
          gameId,
          cards: [...currentGame.deck, ...newCards],
        }),
      );
    }

    // Скидаємо цикл при зміні вибору користувача
    // При зміні вибору користувача (клік на окремий чекбокс) скидаємо cycleState до 0, щоб цикл починався заново з CHECKED_ALL. Це забезпечує передбачувану поведінку.
    setCycleState(2);
  };

  return (
    <>
      <h1>Select Decks</h1>

      <div className={css.totalDecks}>
        <div className={css.checkboxWrapper}>
          <div
            // className={css.checkBoxAllDecksLabel}
            className={`${css.checkBoxAllDecksLabel} ${
              selectAllState === CHECKED_ALL
                ? css.checked
                : selectAllState === CHECKED_USER
                ? css.indeterminate
                : ""
            }`}
            onClick={handleSelectAllDecks}></div>
        </div>

        <p>{`${t("total_cards")}: ${currentGame.deck.length}`}</p>
      </div>

      <ul className={css.deckList}>
        {allDecks?.map(deck => (
          <li className={css.deck} key={deck._id}>
            <div className={css.checkboxWrapper}>
              <label className={css.checkBoxLabel}>
                <input
                  className={css.checkboxInput}
                  type="checkbox"
                  name={`selectDeck-${deck._id}`}
                  onChange={() => handleSelectDeck(deck)}
                  checked={selectedDeckIds.includes(deck._id)}
                />
                {t("single_card_mode").toUpperCase()}
              </label>
            </div>

            <button
              className={css.redirectContainer}
              onClick={() => navigate(`${deck._id}`)}>
              {deck.name}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
