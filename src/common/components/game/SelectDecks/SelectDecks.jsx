import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import { setCurrentDeckId } from "redux/game/gameSlice.js";
// import Button from "common/components/ui/Button/index.js";
// import ImgGen from "common/components/ui/ImgGen/index.js";
import {
  // useGetCurrentDeckQuery,
  useGetAllDecksQuery,
} from "redux/game/gameApi.js";
import {
  selectCycleState,
  selectLocalGame,
  selectSelectedDeckIds,
  selectUserSelectedDeckIds,
} from "redux/selectors.js";
import { useCallback, useEffect } from "react";
import {
  CHECKED_NONE,
  CHECKED_ALL,
  CHECKED_USER,
} from "utils/generals/constants.js";
import {
  setActiveActionTest,
  setCycleState,
  setSelectedDeckIds,
  setUserSelectedDeckIds,
} from "redux/game/gameSlice.js";
import {
  deleteCardsFromDeck,
  setGameDeck,
  setPageHeaderText,
  setPageHeaderTextSecond,
} from "redux/game/localPersonalSlice.js";
import socket from "services/socket.js";
import { Notify } from "notiflix";
import { useBackButton } from "context/BackButtonContext.jsx";

import {
  MdArrowForwardIos,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdIndeterminateCheckBox,
} from "react-icons/md";
import css from "./SelectDecks.module.scss";
import clsx from "clsx";

export default function SelectDecks() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { gameId } = useParams();
  const currentGame = useSelector(selectLocalGame(gameId));
  useEffect(() => {
    if (!currentGame) {
      navigate("/game");
      return;
    }
  }, [currentGame, navigate]);

  const { showBackButton, hideBackButton, backButtonConfig } = useBackButton();

  //# Page header color and text
  useEffect(() => {
    const headerTitleText = t("game_cards");
    dispatch(setPageHeaderText(headerTitleText));
    dispatch(setPageHeaderTextSecond(""));
  }, [dispatch, t]);

  const optimisticCardsListUpdate = useCallback(
    ({ previousGameState, gameId, cards, timeout = 2000 }) => {
      console.log("optimisticCardsListUpdate");

      const eventName = "CardsList_Update";
      setGameDeck({ gameId, cards }); // оптимістичне оновлення стану
      socket.emit(eventName, { updatedGame: currentGame }); // запит на сервер для оновлення і на сервері

      // Встановлення таймеру для відкату, якщо щось пішло не так
      const timer = setTimeout(() => {
        Notify.failure(t("err_no_response_server"), {
          eventName: eventName,
        });

        // Встановлення попереднього стану, якщо час вийшов, а відповіді від сервера не надійшло
        dispatch(
          setGameDeck({
            gameId: previousGameState._id,
            cards: previousGameState.deck,
          }),
        );
      }, timeout);

      const key = `${eventName}-${gameId}`;
      // Записую в стейт таймер для скидання, якщо запит успішний і попередній стан для відкату, якщо прийшла помилка
      dispatch(
        setActiveActionTest({
          key,
          value: { timer, previousGameState, eventName },
        }),
      );
    },
    [currentGame, dispatch, t],
  );

  // унікальна кнопка повернення назад - запускає socket.emit обраних колод на сервак.
  const handleBackClick = useCallback(() => {
    console.log("handleBackClick -> optimisticCardsListUpdate");

    optimisticCardsListUpdate({
      previousGameState: currentGame,
      gameId: currentGame._id,
      cards: currentGame.deck,
    });

    navigate(-1);
    // navigate(`game/${currentGame._id}/setup/select-decks`);
  }, [currentGame, navigate, optimisticCardsListUpdate]);

  useEffect(() => {
    console.log("set showBackButton in SelectDecks");
    showBackButton({ onClick: handleBackClick, priority: 2 });

    return () => hideBackButton({ priority: 0 });
  }, [handleBackClick, hideBackButton, showBackButton]);

  // const currentDeckId = useSelector(selectCurrentDeckId);

  const { data: allDecks } = useGetAllDecksQuery();
  // const { data: currentDeck } = useGetCurrentDeckQuery(currentDeckId, {
  //   skip: !currentDeckId,
  // });

  // Стан для відстеження обраних колод
  const selectedDeckIds = useSelector(selectSelectedDeckIds);
  // Стан для збереження вибору користувача
  const userSelectedDeckIds = useSelector(selectUserSelectedDeckIds);
  // Стан для відстеження циклу (0: CHECKED_ALL, 1: CHECKED_NONE, 2: CHECKED_USER)
  const cycleState = useSelector(selectCycleState);

  // Синхронізація чекбоксів із gameDeck при завантаженні
  useEffect(() => {
    if (!currentGame) return;

    if (
      allDecks &&
      currentGame.deck?.length > 0 &&
      selectedDeckIds.length === 0
    ) {
      const deckIdsWithCards = allDecks
        .filter(deck =>
          deck.cards.some(card =>
            currentGame.deck.some(gc => gc._id === card._id),
          ),
        )
        .map(deck => deck._id);
      dispatch(setSelectedDeckIds(deckIdsWithCards));
      dispatch(setUserSelectedDeckIds(deckIdsWithCards));
    }
  }, [allDecks, selectedDeckIds, dispatch, currentGame]);

  // Визначення стану загального чекбокса
  const getSelectAllState = () => {
    if (!allDecks) return CHECKED_NONE;
    if (selectedDeckIds.length === 0) return CHECKED_NONE;
    if (selectedDeckIds.length === allDecks.length) return CHECKED_ALL;
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
        dispatch(setSelectedDeckIds(allDeckIds));
        dispatch(setUserSelectedDeckIds(allDeckIds));

        const allCards = allDecks.flatMap(deck => deck.cards);
        dispatch(setGameDeck({ gameId, cards: allCards }));
        // optimisticCardsListUpdate({
        //   previousGameState: currentGame,
        //   gameId,
        //   cards: allCards,
        // });
        dispatch(setCycleState(0));
      } else {
        // Зняти вибір з усіх колод
        dispatch(setSelectedDeckIds([]));
        dispatch(setUserSelectedDeckIds([]));
        dispatch(setGameDeck({ gameId, cards: [] }));
        // optimisticCardsListUpdate({
        //   previousGameState: currentGame,
        //   gameId,
        //   cards: [],
        // });

        dispatch(setCycleState(1));
      }
    } else {
      // Цикл для часткового вибору: CHECKED_ALL -> CHECKED_NONE -> CHECKED_USER
      const nextCycleState = (cycleState + 1) % 3;

      if (nextCycleState === 0) {
        // CHECKED_ALL: Обрати всі колоди
        const allDeckIds = allDecks.map(deck => deck._id);
        dispatch(setSelectedDeckIds(allDeckIds));

        const allCards = allDecks.flatMap(deck => deck.cards);
        dispatch(setGameDeck({ gameId, cards: allCards }));
      } else if (nextCycleState === 1) {
        // CHECKED_NONE: Зняти вибір з усіх колод
        dispatch(setSelectedDeckIds([]));
        dispatch(setGameDeck({ gameId, cards: [] }));
      } else {
        // CHECKED_USER: Повернути до вибору користувача
        dispatch(setSelectedDeckIds(userSelectedDeckIds));

        const userSelectedDecks = allDecks.filter(deck =>
          userSelectedDeckIds.includes(deck._id),
        );
        const userSelectedCards = userSelectedDecks.flatMap(deck => deck.cards);
        dispatch(setGameDeck({ gameId, cards: userSelectedCards }));
      }

      dispatch(setCycleState(nextCycleState));
    }
  };

  // Обробка кліку на окремий чекбокс
  const handleSelectDeck = deck => {
    console.log("deck :>> ", deck.cards);
    if (cycleState === 1) dispatch(setUserSelectedDeckIds([]));

    const isSelected = selectedDeckIds.includes(deck._id);
    let newSelectedDeckIds;
    let newUserSelectedDeckIds;

    if (isSelected) {
      // Видалити колоду
      newSelectedDeckIds = selectedDeckIds.filter(id => id !== deck._id);
      newUserSelectedDeckIds = userSelectedDeckIds.filter(
        id => id !== deck._id,
      );
      dispatch(setSelectedDeckIds(newSelectedDeckIds));
      dispatch(setUserSelectedDeckIds(newUserSelectedDeckIds));
      dispatch(deleteCardsFromDeck({ gameId, removingCards: deck.cards }));
    } else {
      // Додати колоду, якщо її немає
      const newSelectedDeckIds = selectedDeckIds.includes(deck._id)
        ? selectedDeckIds
        : [...selectedDeckIds, deck._id];

      const newUserSelectedDeckIds = userSelectedDeckIds.includes(deck._id)
        ? userSelectedDeckIds
        : [...userSelectedDeckIds, deck._id];

      dispatch(setSelectedDeckIds(newSelectedDeckIds));
      dispatch(setUserSelectedDeckIds(newUserSelectedDeckIds));
      // Додаємо тільки нові карти, уникаючи дублювання
      const newCards = deck.cards.filter(
        card =>
          !currentGame.deck.some(existingCard => existingCard._id === card._id),
      );
      dispatch(
        setGameDeck({ gameId, cards: [...currentGame.deck, ...newCards] }),
      );
    }

    // Скидаємо цикл при зміні вибору користувача
    // При зміні вибору користувача (клік на окремий чекбокс) скидаємо cycleState до 0, щоб цикл починався заново з CHECKED_ALL. Це забезпечує передбачувану поведінку.
    dispatch(setCycleState(2));
  };

  const isDisabledCheckbox = currentGame.isGameRunning;

  return (
    <>
      <div className={css.decksContainer}>
        {/* <h1>Select Decks</h1> */}

        <div>
          <div className={css.totalDecksItem}>
            <label className={css.label}>
              <input
                className={css.input}
                type="checkbox"
                // checked={selectedDeckIds.includes(deck._id)}
                onChange={handleSelectAllDecks}
                disabled={isDisabledCheckbox}
              />

              {selectAllState === CHECKED_ALL ? (
                <MdCheckBox
                  className={clsx(css.icon, {
                    [css.disabled]: isDisabledCheckbox,
                  })}
                />
              ) : selectAllState === CHECKED_USER ? (
                <MdIndeterminateCheckBox
                  className={clsx(css.icon, {
                    [css.disabled]: isDisabledCheckbox,
                  })}
                />
              ) : (
                <MdCheckBoxOutlineBlank
                  className={clsx(css.icon, {
                    [css.disabled]: isDisabledCheckbox,
                  })}
                />
              )}

              <span className={css.itemText}>{t("total_cards")}</span>
              <div className={css.itemRightGroup}>
                <p>{currentGame?.deck?.length}</p>
                <div className={css.icon} />
              </div>
            </label>
          </div>

          <ul className={css.list}>
            {allDecks?.map(deck => (
              <li className={css.listItem} key={deck._id}>
                <label className={css.label}>
                  <input
                    className={css.input}
                    type="checkbox"
                    checked={selectedDeckIds.includes(deck._id)}
                    onChange={() => handleSelectDeck(deck)}
                    disabled={isDisabledCheckbox}
                  />

                  {selectedDeckIds.includes(deck._id) ? (
                    <MdCheckBox
                      className={clsx(css.icon, {
                        [css.disabled]: isDisabledCheckbox,
                      })}
                    />
                  ) : (
                    <MdCheckBoxOutlineBlank
                      className={clsx(css.icon, {
                        [css.disabled]: isDisabledCheckbox,
                      })}
                    />
                  )}
                  <span className={css.itemText}>{deck.name}</span>
                  <div className={css.itemRightGroup}>
                    <p>{deck.cards.length}</p>
                    <button
                      className={css.iconBtn}
                      onClick={() =>
                        navigate(`${deck._id}`, { state: { deck } })
                      }>
                      <MdArrowForwardIos
                        className={clsx(css.icon, css.mgnLeft, {
                          [css.disabled]: isDisabledCheckbox,
                        })}
                      />
                    </button>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* <h1>Select Decks</h1>

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

        <p>{`${t("total_cards")}: ${currentGame?.deck?.length}`}</p>
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
              </label>
            </div>

            <button
              className={css.redirectContainer}
              onClick={() => navigate(`${deck._id}`, { state: { deck } })}>
              {deck.name}
            </button>
          </li>
        ))}
      </ul> */}
    </>
  );
}
