import css from "./Button.module.scss";

export default function Button({ buttonText, onClick }) {
  return (
    <>
      <button className={css.buttonPrimary} type="submit" onClick={onClick}>
        {buttonText.toUpperCase()}
      </button>
    </>
  );
}
