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
        src="https://res.cloudinary.com/dixium/image/upload/v1/dixium/dixium_title/_70be603e-c777-4e80-a291-fb235da25228_n6v7c1?_a=BAMCkGRg0"
        alt="title"
      />
    </div>
  );
}
