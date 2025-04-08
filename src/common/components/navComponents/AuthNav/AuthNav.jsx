import { NavLink } from "react-router-dom";
import clsx from "clsx";
import css from "./AuthNav.module.scss";
import { useTranslation } from "react-i18next";

export default function AuthNav({ closeMenu }) {
  const { t } = useTranslation();

  return (
    <>
      <div className={css.navBar}>
        <NavLink
          to="/register"
          onClick={closeMenu}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("register").toUpperCase()}
        </NavLink>

        <NavLink
          to="/login"
          onClick={closeMenu}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("login").toUpperCase()}
        </NavLink>
      </div>
    </>
  );
}
