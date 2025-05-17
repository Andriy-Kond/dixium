import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppBar from "common/components/navComponents/AppBar";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPageHeaderBgColor,
  selectPageHeaderText,
  selectPageHeaderTextColor,
  selectPageHeaderTextSecond,
} from "redux/selectors.js";
import {
  setPageHeaderText,
  setPageHeaderTextSecond,
} from "redux/game/localPersonalSlice.js";

import { useTranslation } from "react-i18next";
import { useBackButton } from "context/BackButtonContext.jsx";

import { MdArrowBack } from "react-icons/md";
import css from "./SharedLayout.module.scss";

export default function SharedLayout() {
  // console.log("SharedLayout");
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // console.log("Current location:", {
  //   locationPathname: location.pathname,
  //   locationKey: location.key,
  // });

  const { showBackButton, hideBackButton, backButtonConfig } = useBackButton();

  const pageHeaderText = useSelector(selectPageHeaderText);
  const pageHeaderTextSecond = useSelector(selectPageHeaderTextSecond);
  const pageHeaderBgColor = useSelector(selectPageHeaderBgColor);
  const pageHeaderTextColor = useSelector(selectPageHeaderTextColor);
  const isHomePage = location.pathname === "/";
  const isGamesListPage = location.pathname === "/game";

  const [isMobile, setIsMobile] = useState(false);

  // useEffect(() => {
  //   const prefersDark = window.matchMedia(
  //     "(prefers-color-scheme: dark)",
  //   ).matches;
  //   dispatch(setTheme(prefersDark ? DARK : LIGHT));
  // }, [dispatch]);

  //# Page header color and text
  // useEffect(() => {
  //   if (!location.pathname.includes("game")) {
  //     dispatch(setPageHeaderText("")); // clear text for Home page
  //   }
  // }, [dispatch, location.pathname, t]);

  // Check if it is mobile viewport for removing game header in Home page
  useEffect(() => {
    const updateViewport = () => {
      // const innerWidth = window.innerWidth; // !not works in Chrome
      // const clientWidth = document.documentElement.clientWidth; // OK: native
      // const visualViewport = window.visualViewport.width; // OK: дозволяє отримати розміри видимої області з урахуванням масштабування та динамічних змін (наприклад, при появі екранної клавіатури на мобільних пристроях).

      const width = window.visualViewport
        ? window.visualViewport.width
        : document.documentElement.clientWidth;

      // window.devicePixelRatio показує співвідношення фізичних пікселів до CSS-пікселів
      // const widthPixelRatio = window.innerWidth / window.devicePixelRatio;
      setIsMobile(width <= 768);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const handleBackClick = useCallback(() => {
    // console.log("handleBackClick SharedLayout");

    navigate(-1); // Повертається на попередній маршрут у стеку історії
  }, [navigate]);

  // const isGameRoute = /^\/game\/[^/]+$/.test(location.pathname); // Перевіряє /game/:gameId

  // Логіка за замовчуванням: показувати кнопку для всіх маршрутів, окрім "/" і "/game"
  const shouldShowBackButton = !isHomePage && !isGamesListPage;

  // Показ кнопки "Назад" для маршрутів.
  // useLayoutEffect виконується синхронно після всіх маніпуляцій з DOM, що може допомогти уникнути асинхронних проблем.
  useEffect(() => {
    // console.log(" useEffect >> shouldShowBackButton:::", shouldShowBackButton);
    if (shouldShowBackButton) {
      // Пріоритет 0 — найнижчий, щоб дочірні компоненти могли перевизначити
      // console.log("set showBackButton in SharedLayout");
      // console.log(" SharedLayout >> location.pathname:::", location.pathname);

      showBackButton(handleBackClick, "back", 1);
    } else {
      // console.log("SharedLayout >> Ховаю кнопку :>> ");
      hideBackButton(3);
    }
  }, [handleBackClick, hideBackButton, shouldShowBackButton, showBackButton]);

  // useEffect(() => {
  //   console.log(
  //     "SharedLayout >> Ховаю кнопку, бо розмонтувався компонент :>> ",
  //   );
  //   return () => hideBackButton(0);
  // }, [hideBackButton]);

  const isShowMenu = location.pathname.includes("/current-game");

  return (
    <>
      <main className={css.mainContainer}>
        <Suspense
          fallback={
            <div className={css.suspenseLoaderContainer}>
              <span className={css.loader} />
            </div>
          }>
          {!isHomePage && (isMobile || location.pathname.includes("game")) && (
            <header
              className={css.pageHeader}
              style={{
                "--pageHeaderBgColor": pageHeaderBgColor,
                "--pageHeaderTextColor": pageHeaderTextColor,
              }}>
              {backButtonConfig.isVisible && (
                <button
                  className={css.backButton}
                  onClick={() => backButtonConfig.onClick()}>
                  <MdArrowBack className={css.backButtonIcon} />
                </button>
              )}
              <div className={css.pageHeaderTextContainer}>
                <span className={css.pageHeaderText}>{pageHeaderText}</span>
                <span className={css.pageHeaderText}>
                  {pageHeaderTextSecond}
                </span>
              </div>
            </header>
          )}

          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
