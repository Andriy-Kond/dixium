import { useTranslation } from "react-i18next";
import Button from "common/components/ui/Button";
import css from "./LangSwitcher.module.scss";
import useI18n from "locales/useI18n.js";

export default function LangSwitcher() {
  const { i18n } = useTranslation();
  const { lang, setNewLang } = useI18n(); // Отримуємо мову з Redux і функцію для її зміни

  // const changeLanguage = lng => {
  //   i18n.changeLanguage(lng);
  // };

  const handleChangeLang = lng => {
    i18n.changeLanguage(lng);
    setNewLang(lng); // Зберігаємо нову мову в Redux
  };

  return (
    <>
      <div className={css.langBtns}>
        <Button
          btnStyle={["whiteColor"]}
          onClick={() => handleChangeLang("en")}>
          EN
        </Button>
        <Button
          btnStyle={["whiteColor"]}
          onClick={() => handleChangeLang("uk")}>
          UA
        </Button>
      </div>
    </>
  );
}
