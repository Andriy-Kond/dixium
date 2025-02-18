import css from "./Button.module.scss";
import clsx from "clsx";

export default function Button({
  btnText = "",
  onClick,
  btnStyle = [],
  localClassName,
  disabled = false,
}) {
  const buttonClassNames = clsx(
    css.btnPrimary,
    btnStyle.map(className => css[className]),
    localClassName,
  );

  return (
    <>
      <button
        className={buttonClassNames}
        type="submit"
        onClick={onClick}
        disabled={disabled}>
        {btnText.toUpperCase()}
      </button>
    </>
  );
}
