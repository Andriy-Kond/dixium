import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "redux/game/localPersonalSlice.js";
import { selectTheme } from "redux/selectors.js";
import { LIGHT } from "utils/generals/constants.js";
import css from "./ThemeToggle.module.scss";

export default function ThemeToggle() {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const theme = useSelector(selectTheme);

  return (
    <>
      {/* <button
        className={css.switcher}
        onClick={() => {
          dispatch(toggleTheme());
        }}>
        {theme === LIGHT
          ? t("switch_to_dark_theme")
          : t("switch_to_light_theme")}
      </button> */}

      <label className={css.switch}>
        <input
          type="checkbox"
          checked={theme === LIGHT}
          onChange={() => {
            dispatch(toggleTheme());
          }}
        />
        <span className={css.slider}></span>
      </label>
    </>
  );
}
