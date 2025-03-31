import { useTranslation } from "react-i18next";
import css from "./HomePage.module.scss";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <div className={css.homePageContainer}>
      {/* <h2>Home Page</h2> */}
      <p>{t("welcome_to_the_dixium")}</p>

      <img
        className={css.tileImg}
        src="https://res.cloudinary.com/dixium/image/upload/v1743245347/dixium/dixium_title/2Q_1_xjrxdx.jpg"
        alt="title"
      />
    </div>
  );
}
