// import { useNavigate } from "react-router-dom";

import {
  selectIsCreatingGame,
  selectUserCredentials,
} from "redux/selectors.js";
import { setIsCreatingGame } from "redux/game/gameSlice.js";
import { useDispatch, useSelector } from "react-redux";
import DecksList from "../../../components/game/DecksList";
import Button from "common/components/ui/Button";
import GamesList from "../../../components/game/GamesList";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import {
  setPageHeaderBgColor,
  setPageHeaderText,
} from "redux/game/localPersonalSlice.js";
import socket from "services/socket.js";
import css from "./GamesListPage.module.scss";

export default function GamesListPage() {
  // const navigate = useNavigate();
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

  const createGame = () => {
    dispatch(setIsCreatingGame(true));
    // navigate("/game/create");
  };

  const [searchGame, setSearchGame] = useState(null); // Чисте значення для пошуку (type: Number)
  // const [displayValue, setDisplayValue] = useState(""); // Значення для відображення з дефісом (type: String)
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleChange = e => {
    const input = e.target;
    const inputRawValue = input.value.replace(/[^0-9]/g, ""); // Фільтрує лише цифри
    const inputValue = inputRawValue.slice(0, 4); // Обмеження до 4 цифр

    const numericValue = inputValue ? parseInt(inputValue, 10) : null; // Якщо inputValue порожній, numericValue буде null, що унеможливлює NaN при відправці на сервер у emitSearch
    setSearchGame(numericValue); // type: Number

    // // Форматування для відображення
    // if (inputValue.length <= 2) {
    //   setDisplayValue(inputValue);
    // } else {
    //   setDisplayValue(`${inputValue.slice(0, 2)}-${inputValue.slice(2)}`);
    // }

    // Форматування для відображення
    let formattedValue = inputRawValue;
    if (inputRawValue.length > 2) {
      formattedValue = `${inputRawValue.slice(0, 2)}-${inputRawValue.slice(2)}`;
    }

    // Оновлюємо значення інпута
    input.value = formattedValue;

    setError(null);
  };

  // Допоміжна функція для підрахунку кількості цифр
  const getDigitCount = () => {
    return searchGame ? String(searchGame).length : 0;
  };

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

  // const handleSubmit = e => {
  //   e.preventDefault();
  //   // Відправка запиту, якщо є хоча б одна цифра
  //   if (searchGame && searchGame <= 9999) {
  //     socket.emit("gameFindActive", { searchGame });
  //   } else {
  //     console.log("error: player-game number is incorrect");
  //   }
  // };

  // const resetSearchGame = () => {
  //   setSearchGame(null);
  //   setDisplayValue("");

  //   // socket.emit("gameFindActive", { searchGame: null }); // todo налаштувати сервер на підтримку скидання запиту
  // };

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
                      // value={displayValue}
                      placeholder="Search by number..."
                      // pattern="[0-9]*" // валідація - лише цифри і порожній рядок
                      // pattern="\d*" // теж лише цифри, але з арабськими у юнікоді

                      inputMode="numeric" // одразу відкриє мобільну клавіатуру з цифрами на моб. пристроях
                      maxLength={5} // 4 цифри + дефіс
                      aria-label={t("search_game_by_number")}
                    />

                    <p className={css.hint}>{t("enter_4_digits")}</p>
                  </label>

                  {/* {displayValue && (
                    <button
                      className={css.clearButton}
                      onClick={resetSearchGame}
                      type="button">
                      {t("clear")}
                    </button>
                  )} */}

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
                    disabled={getDigitCount() !== 4 || searchGame > 9999}
                    // disabled={!searchGame || searchGame > 9999}
                  >
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

//  If use it as individual pages (without prop "isCreatingGame")
//  <Routes>
//    <Route path="/" element={<GameInitial />} />
//    <Route path="/create" element={<CreateGame />} />
//  </Routes>
