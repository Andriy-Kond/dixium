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

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) {
      toggleMenu();
    }
  };

  useEffect(() => {
    setIsOpen(false); // Закриваємо меню при логіні або логауті
  }, [isLoggedIn, isUserToken]);

  // Exit by press Esc key
  useEffect(() => {
    const handleKeydownEsc = e => {
      if (e.code === "Escape") setIsOpen(false);
    };

    if (isOpen) window.addEventListener("keydown", handleKeydownEsc);

    return () => window.removeEventListener("keydown", handleKeydownEsc);
  }, [isOpen]);

  return (
    <nav className={css.navMenu}>
      <button className={css.burgerBtn} onClick={toggleMenu}>
        ☰
      </button>

      <div
        className={`${css.barList} ${isOpen && css.isOpen} `}
        onClick={handleBackdropClick}>
        <NavigationMenu toggleMenu={toggleMenu} />

        <div className={css.serviceMenuContainer}>
          {/* перевірка щоб при перезавантаженні сторінки при наявному токені не блимало спочатку AuthNav, а потім UserMenu: */}
          {isUserToken && isLoggedIn ? (
            <UserMenu toggleMenu={toggleMenu} />
          ) : (
            <AuthNav toggleMenu={toggleMenu} />
          )}

          <LangSwitcher />

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
