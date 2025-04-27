import { Suspense, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
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

export default function SharedLayout() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const theme = useSelector(selectTheme);
  const location = useLocation();

  const pageHeaderText = useSelector(selectPageHeaderText);
  const pageHeaderBgColor = useSelector(selectPageHeaderBgColor);
  const pageHeaderTextColor = useSelector(selectPageHeaderTextColor);

  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <>
      <main className={css.mainContainer} data-theme={theme}>
        <header className={css.navHeader}>
          <AppBar />
        </header>

        <Suspense
          fallback={
            <div className={css.suspenseLoaderContainer}>
              <span className={css.loader} />
            </div>
          }>
          {(isMobile || location.pathname.includes("game")) && (
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

          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
