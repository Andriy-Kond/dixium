import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <>
      <h2>{t("not_found_page")}</h2>
      <h3>{t("page_not_exist")}</h3>
      <Link to="/">{t("back_to_main_page")}</Link>
    </>
  );
}

export default NotFoundPage;
