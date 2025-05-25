import { useRef } from "react";
import css from "./FormInput.module.scss";

export default function FormInput({
  handleSubmit,
  isDisableSubmitBtn = false,
  btnText = "",
  value,
  onChange,
  inputMode = "text",
  placeholder = "",
  maxLength = 100,
  ariaLabel = "",
}) {
  const inputRef = useRef(null);
  const handleFocus = () => {
    // console.log("on Focus");
    inputRef.current.classList.add(css["input-focused"]);
  };
  const handleBlur = () => {
    // console.log("on Blur");

    inputRef.current.classList.remove(css["input-focused"]);
  };
  return (
    <>
      <form className={css.searchForm} onSubmit={handleSubmit}>
        <input
          // className={`${css.searchInput} ${
          //   isCanFind && css.searchInputReady
          // }`}
          className={css.searchInput}
          ref={inputRef}
          // autoFocus // виникає проблема при видаленні гри - ref не встигає сформуватись (треба додавати useEffect чи setTimeout для встановлення класу input-focused)
          type="text"
          onChange={onChange}
          value={value} // ??
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          aria-label={ariaLabel}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {/* {searchGameNumber && (
              <button
                className={css.clearButton}
                type="button"
                onClick={resetSearchGame}>
                {t("clear")}
              </button>
            )} */}

        <button className={css.btn} type="submit" disabled={isDisableSubmitBtn}>
          {btnText}
        </button>
      </form>
    </>
  );
}
