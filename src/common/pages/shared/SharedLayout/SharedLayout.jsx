import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "common/components/navComponents/AppBar";
import css from "./SharedLayout.module.scss";

export default function SharedLayout() {
  return (
    <>
      <main>
        <header className={css.navHeader}>
          <AppBar />
        </header>

        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
