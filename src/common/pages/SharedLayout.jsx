import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "common/components/navigation/AppBar";

export default function SharedLayout() {
  return (
    <>
      <main>
        <header>
          <AppBar />
        </header>

        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
