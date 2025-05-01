import { Route, Routes, useNavigate } from "react-router-dom";
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
import { selectIsSetPassword, selectUserToken } from "./redux/selectors";
import { useSetupSocketListeners } from "hooks/useSetupSocketListeners.js";
import { ToastContainer } from "react-toastify";

Notify.init({
  clickToClose: true,
});

const RegisterPage = lazy(() => import("common/pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("common/pages/auth/LoginPage"));
const SetPasswordPage = lazy(() => import("common/pages/auth/SetPasswordPage"));
const VerifyEmailPage = lazy(() => import("common/pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() =>
  import("common/pages/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() =>
  import("common/pages/auth/ResetPasswordPage"),
);

const GamesListPage = lazy(() => import("common/pages/game/GamesListPage"));
const CurrentGamePage = lazy(() => import("common/pages/game/CurrentGamePage"));

const NotFoundPage = lazy(() => import("common/pages/shared/NotFoundPage"));

export default function App() {
  // console.log("App.jsx mounted");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSetPassword = useSelector(selectIsSetPassword);
  const authUserToken = useSelector(selectUserToken);
  const {
    data: userData,
    isSuccess,
    isFetching,
    error,
  } = useGetUserByTokenQuery(undefined, { skip: !authUserToken }); // якщо токен нема, то запиту не буде (при переході на cookie замінити на skip: !isLoggedIn)

  useSetupSocketListeners(); // Підписка на всі слухачі сокетів

  useEffect(() => {
    if (!isFetching)
      if (isSuccess) {
        dispatch(setIsLoggedIn(true));

        if (isSetPassword) {
          navigate("/set-password"); // Перенаправлення, якщо прапор увімкнено
        } else if (error?.data?.message.includes("Email not verified")) {
          navigate("/verify-email");
        }
      } else {
        dispatch(setIsLoggedIn(false));
      }
  }, [
    dispatch,
    error?.data?.message,
    isFetching,
    isSetPassword,
    isSuccess,
    navigate,
  ]);

  return (
    <>
      {/* Перевірка !isFetching && - щоб при залогіненому користувачі не мигала спочатку сторінка Login і потім Contacts */}
      <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        locale="en">
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route element={<PrivateRoute redirectTo="/" />}>
              <Route path="/game" element={<GamesListPage />} />
              <Route path="/game/:gameId" element={<CurrentGamePage />} />
              <Route path="/set-password" element={<SetPasswordPage />} />
            </Route>

            <Route element={<PublicRoute redirectTo="/game" />}>
              <Route index element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/reset-password/:resetToken"
                element={<ResetPasswordPage />}
              />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>

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
