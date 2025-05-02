import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import socket from "services/socket.js";
import { setIsCreatingGame } from "redux/game/gameSlice.js";
import {
  setPageHeaderBgColor,
  setPageHeaderText,
} from "redux/game/localPersonalSlice.js";
import {
  selectAllGames,
  selectIsCreatingGame,
  selectUserCredentials,
} from "redux/selectors.js";
import DecksList from "common/components/game/DecksList";
import CreatingGame from "common/components/game/CreatingGame/CreatingGame.jsx";
import GamesList from "common/components/game/GamesList";
import Button from "common/components/ui/Button";
import css from "./GamesListPage.module.scss";
import { LOBBY } from "utils/generals/constants.js";
import { useNavigate } from "react-router-dom";
import UserMenu from "common/components/navComponents/UserMenu/index.js";
import LangSwitcher from "common/components/navComponents/LangSwitcher/index.js";
import ThemeToggle from "common/components/ui/ThemeToggle/index.js";
import InformMessage from "common/components/ui/InformMessage/InformMessage.jsx";

export default function GamesListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userCredentials = useSelector(selectUserCredentials);
  // const isCreatingGame = useSelector(selectIsCreatingGame);
  // const headerTitleText = isCreatingGame
  //   ? t("creating_game")
  //   : t("available_games");

  const headerTitleText = t("tixid");

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(headerTitleText));
    dispatch(setPageHeaderBgColor("#5D7E9E"));
  }, [dispatch, headerTitleText]);

  const handleCreateGame = () => {
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
      deck: [],
      discardPile: [],
      roundResults: [],
      playerGameId: null,
    };

    socket.emit("createGame", { gameData });
  };

  const [searchGame, setSearchGame] = useState(null); // Чисте значення для пошуку (type: Number)
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const games = useSelector(selectAllGames);
  // const [searchingGame, setSearchingGame] = useState(null);

  useEffect(() => {
    // Скидати поле пошуку лише коли така гра знайдена
    const searchingGame = Object.values(games).find(
      game => game.playerGameId === searchGame,
    );

    if (searchingGame) {
      inputRef.current.value = "";
      setSearchGame(null);
    }
  }, [games, searchGame]);

  const handleChange = e => {
    const input = e.target;
    const inputRawValue = input.value.replace(/[^0-9]/g, ""); // Фільтрує лише цифри
    const inputValue = inputRawValue.slice(0, 4); // Обмеження до 4 цифр

    const numericValue = inputValue ? parseInt(inputValue, 10) : null; // Якщо inputValue порожній, numericValue буде null, що унеможливлює NaN при відправленні на сервер у emitSearch
    setSearchGame(numericValue); // type: Number

    // Форматування для відображення
    let formattedValue = inputRawValue;
    if (inputRawValue.length > 2) {
      formattedValue = `${inputRawValue.slice(0, 2)}-${inputRawValue.slice(2)}`; // Значення для відображення з дефісом
    }

    input.value = formattedValue; // Оновити значення інпута
    setError(null);
  };

  // Допоміжна функція для підрахунку кількості цифр
  const getDigitCount = () => (searchGame ? String(searchGame).length : 0);

  const handleSubmit = e => {
    e.preventDefault();
    const digitCount = getDigitCount();

    // Відправка запиту, якщо є всі 4 цифри
    if (searchGame && digitCount === 4 && searchGame <= 9999) {
      socket.emit("gameFindActive", {
        searchGameNumber: searchGame,
        initUserId: userCredentials._id,
      });
      setError(null);
    } else {
      setError(t("error_invalid_game_number")); // todo додати t(тексти), якщо буде потрібно (можливо просто замінити повідомлення про помилку на глобальну від сервера)
    }
  };

  const resetSearchGame = () => {
    setSearchGame(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setError(null);
  };

  return (
    <>
      <p>GameListPage</p>
      <InformMessage />
      <div className={css.container}>
        <div className={css.pageMain}>
          {/* {isCreatingGame && <CreatingGame />} */}
          {/* {isCreatingGame && <PrepareGame />} */}

          {/* {!isCreatingGame && ( */}
          <>
            <p>{t("req_for_join_game")}</p>
            <div className={css.searchGameWrapper}>
              <form onSubmit={handleSubmit}>
                <label className={css.searchGameLabel}>
                  <input
                    autoFocus
                    ref={inputRef}
                    className={css.searchGameInput}
                    type="text"
                    onChange={handleChange}
                    placeholder={t("enter_id_here")}
                    inputMode="numeric"
                    maxLength={5} // 4 цифри + дефіс
                    aria-label={t("search_game_by_number")}
                  />

                  <p className={css.hint}>{t("enter_4_digits")}</p>
                </label>

                {searchGame && (
                  <button
                    type="button"
                    onClick={resetSearchGame}
                    className={css.clearButton}>
                    {t("clear")}
                  </button>
                )}

                <button
                  className={css.searchButton}
                  type="submit"
                  disabled={getDigitCount() !== 4 || searchGame > 9999}>
                  {t("join")}
                </button>
              </form>
              {error && <p className={css.error}>{error}</p>}
            </div>

            <p>{t("create_own_game")}</p>
            <Button
              onClick={handleCreateGame}
              btnText={`${t("create_new_game")} ID:${
                userCredentials.playerGameId
              }`}
            />

            <p>{t("select_decks")}</p>
            <button
              className={css.copyBtn}
              onClick={() => navigate("/game/select-decks")}>
              {t("game_cards")}
            </button>

            <UserMenu />

            {/* <GamesList /> */}
          </>
          {/* )} */}
        </div>
      </div>
    </>
  );
}
