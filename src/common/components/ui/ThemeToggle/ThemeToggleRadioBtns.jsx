import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setTheme, setVisualTheme } from "redux/game/localPersonalSlice.js";
import { selectVisualTheme } from "redux/selectors.js";
import { LIGHT, DARK, AUTO_THEME } from "utils/generals/constants.js";
import { useCallback, useEffect } from "react";

import { IoMdRadioButtonOn } from "react-icons/io";
import { IoMdRadioButtonOff } from "react-icons/io";
import css from "./ThemeToggleRadioBtns.module.scss";

export default function ThemeToggleRadioBtns() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const visualTheme = useSelector(selectVisualTheme);

  // Обробка зміни теми
  const handleThemeChange = useCallback(
    e => {
      const theme = e.target.value;
      const newTheme = theme === AUTO_THEME ? getSystemTheme() : theme;
      dispatch(setVisualTheme(theme)); // зміна візуала теми (включно з AUTO_THEME)
      dispatch(setTheme(newTheme)); // зміна теми
    },
    [dispatch],
  );

  // Слухач для оновлення теми, якщо користувач змінив системну тему
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (visualTheme === AUTO_THEME) {
        const newTheme = mediaQuery.matches ? DARK : LIGHT;
        dispatch(setTheme(newTheme));
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [dispatch, visualTheme]);

  // Доступні теми
  const themes = [
    { code: AUTO_THEME, label: t("theme_auto") },
    { code: DARK, label: t("theme_dark") },
    { code: LIGHT, label: t("theme_light") },
  ];

  // Визначення системної теми
  const getSystemTheme = () => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    return prefersDark ? DARK : LIGHT;
  };

  return (
    <ul className={css.themeList}>
      {themes.map(({ code, label }) => (
        <li className={css.themeItem} key={code}>
          <label className={css.radioLabel}>
            {label}

            <input
              className={css.radioInput}
              type="radio"
              value={code}
              checked={visualTheme === code}
              onChange={handleThemeChange}
            />

            {visualTheme === code ? (
              <IoMdRadioButtonOn className={css.radioIcon} />
            ) : (
              <IoMdRadioButtonOff className={css.radioIcon} />
            )}
          </label>
        </li>
      ))}
    </ul>
  );
}
