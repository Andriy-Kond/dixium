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

// .btnPrimary {
//   @include btnPrimary;
// }

// .btnBarMenu {
//   @include btnBarMenu;
// }

// .twoBtnsInRow {
//   flex-basis: 50%; // makes size 50% of parent width
// }

// .btnFlexGrow {
//   flex-grow: 1;
// }

// .btnTransparentBorder {
//   border: 1px solid transparent;
// }

// .whiteColor {
//   border: 1px solid #fff;
//   color: #fff;
// }
