import { useSelector } from "react-redux";
import {
  selectTheme,
  selectUserIsLoggedIn,
  selectUserToken,
} from "redux/selectors";

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
  const theme = useSelector(selectTheme);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Стан для монтування, щоб запобігти миганню мобільного меню при оновленні сторінки (або після переходу після login)

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

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1200);
      setIsDesktop(width >= 1200);
    };

    updateViewport();

    setIsMounted(true); // Позначаємо, що компонент змонтовано

    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const handleKeydownEsc = e => {
      if (e.code === "Escape") {
        toggleMenu();
      }
    };

    window.addEventListener("keydown", handleKeydownEsc);
    return () => {
      window.removeEventListener("keydown", handleKeydownEsc);
    };
  }, [toggleMenu]);

  const menuClass = isMobile
    ? `mobileMenu`
    : isTablet
    ? "tabletMenu"
    : isDesktop
    ? "desktopMenu"
    : "tabletMenu"; // За замовчуванням для проміжних розмірів

  return (
    <nav className={css.navMenu}>
      {isMobile && (
        <button className={css.burgerBtn} onClick={toggleMenu}>
          ☰
        </button>
      )}

      <ul
        className={`${css[menuClass]} ${isOpen && css.isOpen}`}
        onClick={handleBackdropClick}
        style={{ display: isMounted ? "flex" : "none" }} // Ховаємо до монтування
      >
        <li>
          <NavigationMenu toggleMenu={toggleMenu} />
        </li>
        <li>
          {/* перевірка щоб при перезавантаженні сторінки при наявному токені не блимало спочатку AuthNav, а потім UserMenu: */}
          {isUserToken && isLoggedIn ? (
            <UserMenu toggleMenu={toggleMenu} />
          ) : (
            <AuthNav toggleMenu={toggleMenu} />
          )}
        </li>
        <li>
          <LangSwitcher />
        </li>
        <li>
          <ThemeToggle />
        </li>
      </ul>
    </nav>
  );
}
