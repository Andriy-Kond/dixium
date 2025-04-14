// import { useNavigate } from "react-router-dom";

import { selectIsCreatingGame } from "redux/selectors.js";
import css from "./GameInitialPage.module.scss";
import { setIsCreatingGame } from "redux/game/gameSlice.js";
import { useDispatch, useSelector } from "react-redux";
import DecksList from "../../../components/game/DecksList/DecksList.jsx";
import Button from "common/components/ui/Button";
import GamesList from "../../../components/game/GamesList/GamesList.jsx";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import {
  setPageHeaderBgColor,
  setPageHeaderText,
} from "redux/game/localPersonalSlice.js";
import socket from "services/socket.js";
import { myDebounce } from "utils/generals/myDebounce.js";

export default function GameInitialPage() {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isCreatingGame = useSelector(selectIsCreatingGame);
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
  const [displayValue, setDisplayValue] = useState(""); // Значення для відображення з дефісом (type: String)

  const debouncedEmitSearch = myDebounce(value => {
    socket.emit("gameFindActive", { searchGame: value });
  }, 300);

  const emitSearch = useCallback(
    value => {
      if (value) debouncedEmitSearch(value);
    },
    [debouncedEmitSearch],
  );

  const handleChange = e => {
    const inputRawValue = e.target.value.replace(/[^0-9]/g, ""); // Фільтрує лише цифри
    const inputValue = inputRawValue.slice(0, 4); // Обмеження до 4 цифр

    const numericValue = inputValue ? parseInt(inputValue, 10) : null; // Якщо inputValue порожній, numericValue буде null, що унеможливлює NaN при відправці на сервер у emitSearch
    setSearchGame(numericValue); // type: Number

    // Форматування для відображення
    if (inputValue.length <= 2) {
      setDisplayValue(inputValue);
    } else {
      setDisplayValue(`${inputValue.slice(0, 2)}-${inputValue.slice(2)}`);
    }

    // Відправка запиту, якщо є хоча б одна цифра

    if (inputValue.length > 0 && numericValue <= 9999) {
      emitSearch(numericValue);
    } else {
      console.log("error: player-game number is incorrect");
    }
  };

  const resetSearchGame = () => {
    setSearchGame(null);
    setDisplayValue("");
  };

  return (
    <>
      <div className={css.container}>
        <div className={css.pageMain}>
          {isCreatingGame && <DecksList />}

          {!isCreatingGame && (
            <>
              <div className={css.searchGameWrapper}>
                <label className={css.searchGameLabel}>
                  <input
                    className={css.searchGameInput}
                    type="text"
                    onChange={handleChange}
                    value={displayValue}
                    placeholder="Search by number..."
                    pattern="[0-9]*" // валідація - лише цифри і порожній рядок
                    // pattern="\d*" // теж лише цифри, але з арабськими у юнікоді
                    inputMode="numeric" // одразу відкриє мобільну клавіатуру з цифрами на моб. пристроях
                    maxLength={5} // 4 цифри + дефіс
                    aria-label={t("search_game_by_number")}
                  />
                </label>

                {displayValue && (
                  <button onClick={resetSearchGame} className={css.clearButton}>
                    Clear
                  </button>
                )}
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
