import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import clsx from "clsx";

import { selectUserIsLoggedIn } from "redux/selectors";

import css from "../navigation.module.scss";
import { useTranslation } from "react-i18next";

export default function NavigationMenu({ setIsOpen, isOpen }) {
  const { t } = useTranslation();
  const isLoggedIn = useSelector(selectUserIsLoggedIn);

  const handleLinkClick = () => {
    if (isOpen) {
      setIsOpen(false); // Закриваємо меню, якщо воно відкрите
    }
  };

  return (
    <>
      <div className={css.navBar}>
        <NavLink
          to="/"
          onClick={handleLinkClick}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("home").toUpperCase()}
        </NavLink>

        {isLoggedIn && (
          <>
            <NavLink
              to="/game"
              onClick={handleLinkClick}
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
