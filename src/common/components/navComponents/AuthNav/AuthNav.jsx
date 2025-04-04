import { NavLink } from "react-router-dom";
import clsx from "clsx";
import css from "common/components/navComponents/navigation.module.scss";
import { useTranslation } from "react-i18next";

export default function AuthNav({ toggleMenu }) {
  const { t } = useTranslation();

  return (
    <>
      <div className={css.navBar}>
        <NavLink
          to="/register"
          onClick={toggleMenu}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("register").toUpperCase()}
        </NavLink>

        <NavLink
          to="/login"
          onClick={toggleMenu}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("login").toUpperCase()}
        </NavLink>
      </div>
    </>
  );
}
