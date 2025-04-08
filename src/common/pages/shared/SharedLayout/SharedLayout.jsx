import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "common/components/navComponents/AppBar";
import css from "./SharedLayout.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  selectPageHeaderBgColor,
  selectPageHeaderText,
  selectPageHeaderTextColor,
  selectTheme,
} from "redux/selectors.js";
import { setTheme } from "redux/game/localPersonalSlice.js";
import { DARK, LIGHT } from "utils/generals/constants.js";

export default function SharedLayout() {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    dispatch(setTheme(prefersDark ? DARK : LIGHT));
  }, [dispatch]);

  const pageHeaderText = useSelector(selectPageHeaderText);
  const pageHeaderBgColor = useSelector(selectPageHeaderBgColor);
  const pageHeaderTextColor = useSelector(selectPageHeaderTextColor);

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
          <div className={css.suspenseMainContainer}>
            <div
              className={css.pageHeader}
              style={{
                "--pageHeaderBgColor": pageHeaderBgColor,
                "--pageHeaderTextColor": pageHeaderTextColor,
              }}>
              {pageHeaderText.toUpperCase()}
            </div>
            <Outlet />
          </div>
        </Suspense>
      </main>
    </>
  );
}
