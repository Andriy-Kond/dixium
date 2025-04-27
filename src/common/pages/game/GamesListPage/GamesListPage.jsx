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
  selectIsCreatingGame,
  selectUserCredentials,
} from "redux/selectors.js";
import DecksList from "common/components/game/DecksList";
import GamesList from "common/components/game/GamesList";
import Button from "common/components/ui/Button";
import css from "./GamesListPage.module.scss";

export default function GamesListPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isCreatingGame = useSelector(selectIsCreatingGame);
  const userCredentials = useSelector(selectUserCredentials);
  const headerTitleText = isCreatingGame
    ? t("creating_game")
    : t("available_games");

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(headerTitleText));
    dispatch(setPageHeaderBgColor("#5D7E9E"));
  }, [dispatch, headerTitleText]);

  const createGame = () => dispatch(setIsCreatingGame(true));

  const [searchGame, setSearchGame] = useState(null); // Чисте значення для пошуку (type: Number)
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

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
      // inputRef.current.value = ""; // todo скидати значення лише коли прийшла успішна відповідь від сервера. Інакше - залишати як є.
      // setSearchGame(null);
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
      <div className={css.container}>
        <div className={css.pageMain}>
          {isCreatingGame && <DecksList />}

          {!isCreatingGame && (
            <>
              <div className={css.searchGameWrapper}>
                <form onSubmit={handleSubmit}>
                  <label className={css.searchGameLabel}>
                    <input
                      autoFocus
                      ref={inputRef}
                      className={css.searchGameInput}
                      type="text"
                      onChange={handleChange}
                      placeholder="Search by number..."
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
                    {t("search")}
                  </button>
                </form>
                {error && <p className={css.error}>{error}</p>}
              </div>

              <GamesList />
              <div className={css.bottomBar}>
                <Button
                  onClick={createGame}
                  btnText={t("create_new_game")}
                  btnStyle={["btnFlexGrow"]}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
