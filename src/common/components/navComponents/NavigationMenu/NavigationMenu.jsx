import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import clsx from "clsx";

import css from "./NavigationMenu.module.scss";
import { useTranslation } from "react-i18next";
import { selectUserIsLoggedIn } from "redux/selectors/selectorsAuthSlice.js";

export default function NavigationMenu({ closeMenu }) {
  const { t } = useTranslation();
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  return (
    <>
      <div className={css.navBar}>
        <NavLink
          to="/"
          onClick={closeMenu}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("home").toUpperCase()}
        </NavLink>

        {isLoggedIn && (
          <>
            <NavLink
              to="/game"
              onClick={closeMenu}
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
