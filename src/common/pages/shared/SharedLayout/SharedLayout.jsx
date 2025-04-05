import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "common/components/navComponents/AppBar";
import css from "./SharedLayout.module.scss";
import { useTranslation } from "react-i18next";

export default function SharedLayout() {
  const { t } = useTranslation();

  return (
    <>
      <main className={css.mainContainer}>
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
