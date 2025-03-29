import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectLang } from "redux/selectors.js";
import { useEffect } from "react";
import { setLang } from "redux/game/localPersonalSlice.js";

const useI18n = () => {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const lang = useSelector(selectLang);

  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang); // Зміна мови в i18next
      dispatch(setLang(lang));
    }
  }, [lang, i18n, dispatch]);

  const setNewLang = newLang => dispatch(setLang(newLang));

  return { lang, setNewLang };
};

export default useI18n;
