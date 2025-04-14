import { useState, useCallback } from "react";
import { debounce } from "lodash";
import socket from "services/socket.js";
import css from "./GameInitialPage.module.scss";

const GameSearch = () => {
  const [searchGame, setSearchGame] = useState("");
  const [displayValue, setDisplayValue] = useState("");

  const emitSearch = useCallback(
    debounce(value => {
      if (value.length > 0) {
        socket.emit("gameFindActive", { searchGame: value });
      }
    }, 300), // Затримка 300ms
    [],
  );

  const handleChange = e => {
    let inputValue = e.target.value.replace(/[^0-9]/g, "");
    inputValue = inputValue.slice(0, 4);

    setSearchGame(inputValue);

    if (inputValue.length <= 2) {
      setDisplayValue(inputValue);
    } else {
      setDisplayValue(`${inputValue.slice(0, 2)}-${inputValue.slice(2)}`);
    }

    emitSearch(inputValue);
  };

  return (
    <div className={css.searchGameWrapper}>
      <label className={css.searchGameLabel}>
        <input
          className={css.searchGameInput}
          type="text"
          onChange={handleChange}
          value={displayValue}
          placeholder="12-34"
          pattern="[0-9]*"
          inputMode="numeric"
          maxLength={5}
        />
      </label>
    </div>
  );
};
