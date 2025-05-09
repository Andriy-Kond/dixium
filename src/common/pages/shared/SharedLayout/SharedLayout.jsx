import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppBar from "common/components/navComponents/AppBar";
import css from "./SharedLayout.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPageHeaderBgColor,
  selectPageHeaderText,
  selectPageHeaderTextColor,
  selectTheme,
} from "redux/selectors.js";
import {
  setPageHeaderBgColor,
  setPageHeaderText,
  setTheme,
} from "redux/game/localPersonalSlice.js";
import { DARK, LIGHT } from "utils/generals/constants.js";
import { useTranslation } from "react-i18next";
import { useBackButton } from "context/BackButtonContext.jsx";
import Button from "common/components/ui/Button/index.js";

export default function SharedLayout() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  // console.log("Current location:", location.pathname, location.key);
  const { showBackButton, hideBackButton, backButtonConfig } = useBackButton();

  const theme = useSelector(selectTheme);
  const pageHeaderText = useSelector(selectPageHeaderText);
  const pageHeaderBgColor = useSelector(selectPageHeaderBgColor);
  const pageHeaderTextColor = useSelector(selectPageHeaderTextColor);

  const isHomePage = location.pathname === "/";
  const isGamesListPage = location.pathname === "/game";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    dispatch(setTheme(prefersDark ? DARK : LIGHT));
  }, [dispatch]);

  useEffect(() => {
    if (!location.pathname.includes("game")) {
      dispatch(setPageHeaderText("")); // clear text for Home page
      dispatch(setPageHeaderBgColor("#5D7E9E")); // set default color on Home page
    }
  }, [dispatch, location.pathname, t]);

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
    console.log("handleBackClick SharedLayout");

    navigate(-1); // Повертається на попередній маршрут у стеку історії
  }, [navigate]);

  // const isGameRoute = /^\/game\/[^/]+$/.test(location.pathname); // Перевіряє /game/:gameId

  // Логіка за замовчуванням: показувати кнопку для всіх маршрутів, окрім "/" і "/game"
  const shouldShowBackButton = !isHomePage && !isGamesListPage;

  // Показ кнопки "Назад" для маршрутів.
  useEffect(() => {
    if (shouldShowBackButton) {
      // Пріоритет 0 — найнижчий, щоб дочірні компоненти могли перевизначити
      // console.log("SharedLayout >> Показую кнопку :>> ");
      showBackButton(handleBackClick, "back", 0);
    } else {
      // console.log("SharedLayout >> Ховаю кнопку :>> ");
      hideBackButton(0);
    }
  }, [handleBackClick, hideBackButton, shouldShowBackButton, showBackButton]);

  // useEffect(() => {
  //   console.log(
  //     "SharedLayout >> Ховаю кнопку, бо розмонтувався компонент :>> ",
  //   );
  //   // return () => hideBackButton(0);
  // }, [hideBackButton]);

  return (
    <>
      <main className={css.mainContainer} data-theme={theme}>
        <Suspense
          fallback={
            <div className={css.suspenseLoaderContainer}>
              <span className={css.loader} />
            </div>
          }>
          {!isHomePage && (isMobile || location.pathname.includes("game")) && (
            <div className={css.suspenseMainContainer}>
              <div
                className={css.pageHeader}
                style={{
                  "--pageHeaderBgColor": pageHeaderBgColor,
                  "--pageHeaderTextColor": pageHeaderTextColor,
                }}>
                {pageHeaderText.toUpperCase()}
              </div>
            </div>
          )}

          <div className={css.navHeader}>
            <AppBar />
          </div>
          <header className={css.navHeader}></header>

          {backButtonConfig.isVisible && (
            <Button
              className={css.backButton}
              onClick={() => backButtonConfig.onClick()}>
              {`<< ${t("back")}`}
            </Button>
          )}

          {/* Умовне відображення AppBar */}
          {/* {!isHomePage ? (
            <header className={css.navHeader}>
              <AppBar />
            </header>
          ) : (
            // Для HomePage AppBar може бути доданий з абсолютним позиціонуванням
            <header className={`${css.navHeader} ${css.homePageNav}`}>
              <AppBar />
            </header>
          )} */}
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
