import css from "./Button.module.scss";

export default function Button({ btnText, onClick, btnStyles = "btnPrimary" }) {
  return (
    <>
      <button className={css[btnStyles]} type="submit" onClick={onClick}>
        {btnText.toUpperCase()}
      </button>
    </>
  );
}
