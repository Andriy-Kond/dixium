import { MdCheck, MdClear } from "react-icons/md";
import css from "./FormEdit.module.scss";
import { useRef } from "react";

export default function FormEdit({
  // isDisableSet = false,
  isDisableReset = false,
  handleClear,
  handleSet,
  value,
  setVal,
  labelText,
  inputMode = "text",
  initialValue,
  isLoading,
}) {
  // зміна стилю форми при фокусі на інпуті для старих браузерів (для нових (з 2018р ) можна використовувати &:focus-within )
  const formRef = useRef(null);

  const handleFocus = () => formRef.current.classList.add(css["input-focused"]);

  const handleBlur = async () => {
    formRef.current.classList.remove(css["input-focused"]);
    if (value !== initialValue) await handleSet(); // щоб не відсилати зайві запити, якщо нікнейм не змінився
  };

  return (
    <>
      <form className={css.form} ref={formRef}>
        {/* {isLoading && <div className={css.loading}>Loading...</div>} */}
        <label className={css.label} htmlFor="input">
          {labelText}
        </label>

        <div className={css.inputContainer}>
          <input
            className={css.input}
            id="input"
            type="text"
            inputMode={inputMode}
            value={value || ""}
            onChange={e => setVal(e.target.value.trim())}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <div className={css.buttonsContainer}>
            {/* <button
              className={css.inputBtn}
              onClick={handleSet}
              type="submit"
              disabled={isDisableSet}>
              <MdCheck className={css.inputBtnIcon} />
            </button> */}

            <button
              type="button"
              className={css.inputBtn}
              onClick={handleClear}
              disabled={isDisableReset}>
              <MdClear className={css.inputBtnIcon} />
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
