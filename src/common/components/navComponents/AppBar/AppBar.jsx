import { useSelector } from "react-redux";
import { selectUserIsLoggedIn, selectUserToken } from "redux/selectors";

import NavigationMenu from "common/components/navComponents/NavigationMenu";
import AuthNav from "common/components/navComponents/AuthNav";
import UserMenu from "common/components/navComponents/UserMenu";

import css from "./AppBar.module.scss";
import LangSwitcher from "common/components/navComponents/LangSwitcher";
import { useCallback, useEffect, useState } from "react";
import ThemeToggle from "common/components/ui/ThemeToggle";

export default function AppBar() {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);
  const isUserToken = useSelector(selectUserToken);

  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const openMenu = useCallback(() => setIsOpen(true), []);

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      closeMenu();
    }
  };

  useEffect(() => {
    closeMenu(); // Close menu after login or logout
  }, [closeMenu, isLoggedIn, isUserToken]);

  // Exit by press Esc key
  useEffect(() => {
    const handleKeydownEsc = e => {
      if (e.code === "Escape") closeMenu();
    };

    if (isOpen) window.addEventListener("keydown", handleKeydownEsc);

    return () => window.removeEventListener("keydown", handleKeydownEsc);
  }, [closeMenu, isOpen]);

  return (
    <nav className={css.navMenu}>
      <label className={css.menuBtn}>
        <input
          className={css.menuInput}
          type="checkbox"
          checked={isOpen}
          onChange={toggleMenu}
        />
        <span></span>
      </label>

      <div
        className={`${css.menuBg} ${isOpen && css.changeBg}`}
        onClick={handleBackdropClick}
      />

      <div
        className={`${css.barList} ${isOpen && css.isOpen} `}
        // className={css.menu__box}
        onClick={handleBackdropClick}>
        <NavigationMenu closeMenu={closeMenu} />

        <div className={css.serviceMenuContainer}>
          {/* перевірка щоб при перезавантаженні сторінки при наявному токені не блимало спочатку AuthNav, а потім UserMenu: */}
          {isUserToken && isLoggedIn ? (
            <UserMenu closeMenu={closeMenu} />
          ) : (
            <AuthNav closeMenu={closeMenu} />
          )}

          <LangSwitcher />

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
