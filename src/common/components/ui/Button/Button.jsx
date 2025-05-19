import css from "./Button.module.scss";
import clsx from "clsx";

export default function Button({
  btnText = "",
  onClick,
  btnStyle = [],
  localClassName,
  disabled = false,
  children,
  type,
}) {
  const buttonClassNames = clsx(
    css.btnPrimary,
    Object.values(btnStyle).map(key => css[key]),
    localClassName,
  );

  return (
    <button
      className={buttonClassNames}
      type={type || "submit"}
      onClick={onClick}
      disabled={disabled}>
      {children}
      {btnText.toUpperCase()}
    </button>
  );
}
