import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import clsx from "clsx";

import { selectUserIsLoggedIn } from "redux/selectors";

import css from "./NavigationMenu.module.scss";
import { useTranslation } from "react-i18next";

export default function NavigationMenu({ toggleMenu }) {
  const { t } = useTranslation();
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return (
    <>
      <div className={css.navBar}>
        <NavLink
          to="/"
          onClick={toggleMenu}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("home").toUpperCase()}
        </NavLink>

        {isLoggedIn && (
          <>
            <NavLink
              to="/game"
              onClick={toggleMenu}
              className={({ isActive }) =>
                clsx(css.link, isActive && css.active)
              }>
              {t("games").toUpperCase()}
            </NavLink>
          </>
        )}
      </div>
    </>
  );
}
