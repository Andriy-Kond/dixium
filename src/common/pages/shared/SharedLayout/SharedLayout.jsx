import { Suspense, useCallback, useEffect, useState } from "react";
import { matchPath, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useSelector } from "react-redux";
import {
  selectComponentHeight,
  selectIsHeightReady,
  selectPageHeaderText,
  selectPageHeaderTextSecond,
} from "redux/selectors.js";

import { useBackButton } from "context/BackButtonContext.jsx";
import { MdArrowBack } from "react-icons/md";
import css from "./SharedLayout.module.scss";
import clsx from "clsx";

export default function SharedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showBackButton, hideBackButton, backButtonConfig } = useBackButton();
  const pageHeaderText = useSelector(selectPageHeaderText);
  const pageHeaderTextSecond = useSelector(selectPageHeaderTextSecond);

  //# Визначення висоти компонента
  const componentHeight = useSelector(selectComponentHeight);
  useEffect(() => {
    console.log("render SharedLayout");
    console.log("SharedLayout >> componentHeight:", componentHeight);
  }, [componentHeight]);
  const isHeightReady = useSelector(selectIsHeightReady);

  const handleBackClick = useCallback(() => {
    navigate(-1); // Повертається на попередній маршрут у стеку історії
  }, [navigate]);

  // const isGameRoute = /^\/game\/[^/]+$/.test(location.pathname); // Перевіряє /game/:gameId
  const isHomePage = location.pathname === "/";
  const isGamesListPage = location.pathname === "/game";
  // const isCurrentGamePage = matchPath(
  //   `/game/:gameId/current-game`,
  //   location.pathname,
  // );

  // Логіка за замовчуванням: показувати кнопку для всіх маршрутів, окрім "/" і "/game"
  const shouldShowBackButton = !isHomePage && !isGamesListPage;
  // && !isCurrentGamePage;

  // Показ кнопки "Назад" для маршрутів.
  // useLayoutEffect виконується синхронно після всіх маніпуляцій з DOM, що може допомогти уникнути асинхронних проблем.
  useEffect(() => {
    if (shouldShowBackButton) {
      // Пріоритет 0 — найнижчий, щоб дочірні компоненти могли перевизначити
      showBackButton({ onClick: handleBackClick, priority: 1 });
    } else {
      hideBackButton({ priority: 3 });
    }
  }, [handleBackClick, hideBackButton, shouldShowBackButton, showBackButton]);

  useEffect(() => {
    console.log(
      "SharedLayout >> Ховаю кнопку, бо розмонтувався компонент :>> ",
    );
    return () => hideBackButton(0);
  }, [hideBackButton]);

  // const [shouldRender, setShouldRender] = useState(false);

  // useEffect(() => {
  //   let timeoutId;

  //   if (componentHeight > 0) {
  //     timeoutId = setTimeout(() => {
  //       setShouldRender(true);
  //     }, 500);
  //   }

  //   return () => {
  //     clearTimeout(timeoutId);
  //     setShouldRender(false);
  //   };
  // }, [componentHeight]);

  return (
    <>
      <main className={css.mainContainer}>
        {isHeightReady ? (
          <div
            className={clsx(css.sharedHeader, { [css.visible]: isHeightReady })}
            style={{ "--height": `${componentHeight}px` }}
          />
        ) : null}
        <Suspense
          fallback={
            <div className={css.suspenseLoaderContainer}>
              <span className={css.loader} />
            </div>
          }>
          {!isHomePage && (
            <header className={css.pageHeader}>
              <div className={css.pageHeaderContainer}>
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
              </div>
            </header>
          )}

          <Outlet />
          {isHeightReady ? (
            <div
              className={clsx(css.sharedHeader, {
                [css.visible]: isHeightReady,
              })}
              style={{ "--height": `${componentHeight}px` }}
            />
          ) : null}
        </Suspense>
      </main>
    </>
  );
}
