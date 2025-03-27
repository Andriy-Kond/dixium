import { useTranslation } from "react-i18next";
import Button from "common/components/ui/Button";
import css from "./LangSwitcher.module.scss";

export default function LangSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = lng => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <div className={css.langBtns}>
        <Button btnStyle={["whiteColor"]} onClick={() => changeLanguage("en")}>
          EN
        </Button>
        <Button btnStyle={["whiteColor"]} onClick={() => changeLanguage("uk")}>
          UA
        </Button>
      </div>
    </>
  );
}
