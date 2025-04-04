import { NavLink } from "react-router-dom";
import clsx from "clsx";
import css from "common/components/navComponents/navigation.module.scss";
import { useTranslation } from "react-i18next";

export default function AuthNav({ setIsOpen, isOpen }) {
  const { t } = useTranslation();

  const handleLinkClick = () => {
    if (isOpen) {
      setIsOpen(false); // Закриваємо меню, якщо воно відкрите
    }
  };

  return (
    <>
      <div className={css.navBar}>
        <NavLink
          to="/register"
          onClick={handleLinkClick}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("register").toUpperCase()}
        </NavLink>

        <NavLink
          to="/login"
          onClick={handleLinkClick}
          className={({ isActive }) => clsx(css.link, isActive && css.active)}>
          {t("login").toUpperCase()}
        </NavLink>
      </div>
    </>
  );
}
