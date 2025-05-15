import { MdCheck, MdClear } from "react-icons/md";
import css from "./EditingForm.module.scss";
import { useRef } from "react";

export default function EditingForm({
  isDisableSet = false,
  isDisableReset = false,
  handleClear,
  handleSet,
  val,
  setVal,
  labelText,
  inputMode = "text",
}) {
  // зміна стилю форми при фокусі на інпуті для старих браузерів (для нових (з 2018р ) можна використовувати &:focus-within )
  const formRef = useRef(null);
  const handleFocus = () => formRef.current.classList.add(css["input-focused"]);
  const handleBlur = () =>
    formRef.current.classList.remove(css["input-focused"]);

  return (
    <>
      <form className={css.form} ref={formRef}>
        <label className={css.label} htmlFor="input">
          {labelText}
        </label>

        <div className={css.inputContainer}>
          <input
            className={css.input}
            id="input"
            type="text"
            inputMode={inputMode}
            value={val}
            onChange={e => setVal(e.target.value.trim())}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />

          <div className={css.buttonsContainer}>
            <button
              type="button"
              className={css.inputBtn}
              onClick={handleSet}
              disabled={isDisableSet}>
              <MdCheck className={css.inputBtnIcon} />
            </button>

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
