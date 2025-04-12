import { Route, Routes } from "react-router-dom";
import { lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Notify } from "notiflix";
import { GoogleOAuthProvider } from "@react-oauth/google";

import PrivateRoute from "common/components/navigation/PvivateRoute";
import PublicRoute from "common/components/navigation/PublicRoute";
import HomePage from "common/pages/HomePage";
import SharedLayout from "common/pages/shared/SharedLayout";
import { useGetUserByTokenQuery } from "redux/auth/authApi";
import { setIsLoggedIn } from "redux/auth/authSlice";
import { selectUserToken } from "./redux/selectors";
import { useSetupSocketListeners } from "hooks/useSetupSocketListeners.js";
import { ToastContainer } from "react-toastify";

Notify.init({
  clickToClose: true,
});

console.log("Google Client ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID);

const RegisterPage = lazy(() => import("common/pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("common/pages/auth/LoginPage"));
const GameInitialPage = lazy(() => import("common/pages/game/GameInitialPage"));
const GameStartedPage = lazy(() => import("common/pages/game/GameStartedPage"));
const NotFoundPage = lazy(() => import("common/pages/shared/NotFoundPage"));

export default function App() {
  const dispatch = useDispatch();

  const authUserToken = useSelector(selectUserToken);
  const { isSuccess, isFetching } = useGetUserByTokenQuery(undefined, {
    skip: !authUserToken, // Пропускає запит, якщо токен відсутній
  });

  useSetupSocketListeners(); // Підписка на всі слухачі сокетів

  useEffect(() => {
    if (!isFetching)
      if (isSuccess) {
        dispatch(setIsLoggedIn(true));
      } else {
        dispatch(setIsLoggedIn(false));
      }
  }, [dispatch, isFetching, isSuccess]);

  return (
    <>
      {/* Перевірка !isFetching && - щоб при залогіненому користувачі не мигала спочатку сторінка Login і потім Contacts */}
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        {!isFetching && (
          <Routes>
            <Route path="/" element={<SharedLayout />}>
              <Route index element={<HomePage />} />

              <Route element={<PrivateRoute redirectTo="/login" />}>
                <Route path="/game/:gameId" element={<GameStartedPage />} />
                <Route path="/game" element={<GameInitialPage />} />
              </Route>

              <Route element={<PublicRoute redirectTo="/game" />}>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        )}

        <ToastContainer
          position="top-center"
          autoClose={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          theme="light"
          // transition="Bounce"
        />
      </GoogleOAuthProvider>
    </>
  );
}
