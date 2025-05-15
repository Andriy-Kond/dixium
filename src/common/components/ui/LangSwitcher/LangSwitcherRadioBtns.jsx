import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectLang } from "redux/selectors.js";
import { setLang } from "redux/game/localPersonalSlice.js";
import { AUTO_LANG, EN, UA } from "utils/generals/constants.js";

import { IoMdRadioButtonOn } from "react-icons/io";
import { IoMdRadioButtonOff } from "react-icons/io";
import css from "./LangSwitcherRadioBtns.module.scss";

export default function LangSwitcherRadioBtns() {
  const dispatch = useDispatch();
  const { i18n, t } = useTranslation();
  const currentLng = useSelector(selectLang);
  // console.log(" LangSwitcherRadioBtns >> currentLng:::", currentLng);

  // Обробка зміни мови
  const handleChangeLang = useCallback(
    e => {
      const lng = e.target.value;
      const newLang = lng === AUTO_LANG ? getSystemLanguage() : lng;
      i18n.changeLanguage(newLang); // Зміна мови в i18next
      dispatch(setLang(lng)); // Зберігаємо вибір (включно з AUTO_LANG) в Redux
    },
    [dispatch, i18n],
  );

  // Слухач для синхронізації мови i18n і стану redux
  useEffect(() => {
    const handleLanguageChange = lng => dispatch(setLang(lng));
    i18n.on("languageChanged", handleLanguageChange);

    return () => i18n.off("languageChanged", handleLanguageChange);
  }, [dispatch, i18n]);

  // Доступні мови
  const languages = [
    { code: AUTO_LANG, label: t("language_auto") },
    { code: UA, label: t("language_ukrainian") },
    { code: EN, label: t("language_english") },
  ];

  // Визначення системної мови
  const getSystemLanguage = () => {
    const browserLang = navigator.language.split("-")[0]; // en, uk з en-US, uk-UA
    return browserLang in [EN, UA] ? browserLang : EN;
  };

  return (
    <ul className={css.langList}>
      {languages.map(({ code, label }) => (
        <li className={css.langItem} key={code}>
          <label className={css.radioLabel}>
            {label}

            <input
              className={css.radioInput}
              type="radio"
              value={code}
              checked={currentLng === code}
              onChange={handleChangeLang}
            />

            {currentLng === code ? (
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
