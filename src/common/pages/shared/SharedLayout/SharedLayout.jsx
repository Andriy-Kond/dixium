import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "common/components/navComponents/AppBar";
import css from "./SharedLayout.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { selectTheme } from "redux/selectors.js";
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

  return (
    <>
      <main className={css.mainContainer} data-theme={theme}>
        <header className={css.navHeader}>
          <AppBar />
        </header>

        <Suspense
          fallback={
            <div className={css.suspenseContainer}>
              <span className={css.loader} />
            </div>
          }>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
