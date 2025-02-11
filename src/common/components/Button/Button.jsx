import css from "./Button.module.scss";

export default function Button({ btnText, onClick, btnStyle = "btnPrimary" }) {
  return (
    <>
      <button className={css[btnStyle]} type="submit" onClick={onClick}>
        {btnText.toUpperCase()}
      </button>
    </>
  );
}
