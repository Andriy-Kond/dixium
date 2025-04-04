import { useSelector } from "react-redux";
import { selectUserIsLoggedIn, selectUserToken } from "redux/selectors";

import NavigationMenu from "common/components/navComponents/NavigationMenu";
import AuthNav from "common/components/navComponents/AuthNav";
import UserMenu from "common/components/navComponents/UserMenu";

import css from "./AppBar.module.scss";
import LangSwitcher from "common/components/navComponents/LangSwitcher";
import { useEffect, useState } from "react";

export default function AppBar() {
  const isLoggedIn = useSelector(selectUserIsLoggedIn);
  const isUserToken = useSelector(selectUserToken);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 320);
      setIsTablet(width > 320 && width <= 768);
      setIsDesktop(width >= 1200);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

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
        <button className={css.burgerBtn} onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>
      )}

      {(isOpen || !menuClass.includes("mobileMenu")) && (
        <div className={css.backdrop} onClick={() => setIsOpen(!isOpen)}>
          <ul className={`${css.menuList} ${css[menuClass]}`}>
            <li>
              <NavigationMenu setIsOpen={setIsOpen} isOpen={isOpen} />
            </li>
            <li>
              {/* перевірка щоб при перезавантаженні сторінки при наявному токені не блимало спочатку AuthNav, а потім UserMenu: */}
              {isUserToken && isLoggedIn ? (
                <UserMenu setIsOpen={setIsOpen} isOpen={isOpen} />
              ) : (
                <AuthNav setIsOpen={setIsOpen} isOpen={isOpen} />
              )}
            </li>
            <li>
              <LangSwitcher />
            </li>
          </ul>
        </div>
      )}

      {/* <NavigationMenu />
      <div className={css.appBarContainer}>
        {isUserToken && isLoggedIn && <UserMenu />}
        {!isUserToken && <AuthNav />}
        <LangSwitcher />
      </div> */}
    </nav>
  );
}
