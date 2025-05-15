import { useTranslation } from "react-i18next";
import { MdCheck, MdClear } from "react-icons/md";
import css from "./EditingForm.module.scss";

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
  const { t } = useTranslation();

  return (
    <>
      <form className={css.form}>
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
