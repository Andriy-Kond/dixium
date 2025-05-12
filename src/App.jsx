import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { lazy, useEffect, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Notify } from "notiflix";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BackButtonProvider } from "context/BackButtonContext.jsx";

import PrivateRoute from "common/components/navigation/PvivateRoute";
import PublicRoute from "common/components/navigation/PublicRoute";
import HomePage from "common/pages/HomePage";
import SharedLayout from "common/pages/shared/SharedLayout";
import { useGetUserByTokenQuery } from "redux/auth/authApi";
import { setIsLoggedIn } from "redux/auth/authSlice";
import { selectIsSetPassword, selectUserToken } from "./redux/selectors";
import { useSetupSocketListeners } from "hooks/useSetupSocketListeners.js";
import { ToastContainer } from "react-toastify";
import { setNetworkStatus } from "redux/game/gameSlice.js";

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

const GameSetup = lazy(() => import("common/components/game/GameSetup"));
const PrepareGame = lazy(() => import("common/components/game/PrepareGame"));
const SortPlayers = lazy(() => import("common/components/game/SortPlayers"));
const SelectDecks = lazy(() => import("common/components/game/SelectDecks"));
const DeckCards = lazy(() => import("common/components/game/decks/DeckCards"));

const CurrentGame = lazy(() => import("common/components/game/CurrentGame"));

const NotFoundPage = lazy(() => import("common/pages/shared/NotFoundPage"));

export default function App() {
  // console.log("App.jsx mounted");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTransition();
  // console.log(" App >> location.pathname:::", location.pathname);

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

  // Дебагінг: логування будь-яких асинхронних помилок.
  useEffect(() => {
    // Коли Promise відхиляється (наприклад, через помилку) і немає обробника catch, браузер генерує подію unhandledrejection.
    const handleUnhandledRejection = event => {
      console.error("Unhandled promise rejection:", event.reason);
      // .reason - містить причину відхилення (rejection) асинхронного Promise
      event.preventDefault(); // запобігає тому, щоб браузер виводив стандартне повідомлення про помилку в консоль (наприклад, Uncaught (in promise) Timeout)
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  // Debugging: Перевірка наявності інтернету
  useEffect(() => {
    const handleOnline = () => {
      Notify.success(t("internet_restored"));
      dispatch(setNetworkStatus(true));
    };
    const handleOffline = () => {
      Notify.failure(t("no_internet"));
      dispatch(setNetworkStatus(false));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // // Початкова перевірка (не обов'язково, якщо через dispatch використовувати у компонентах)
    // if (!navigator.onLine) {
    //   Notify.failure(t("no_internet"));
    //   console.error("No internet connection");
    // }

    dispatch(setNetworkStatus(navigator.onLine));

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dispatch, t]);

  return (
    <>
      {/* Перевірка !isFetching && - щоб при залогіненому користувачі не мигала спочатку сторінка Login і потім Contacts */}
      <GoogleOAuthProvider
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        locale="en">
        <BackButtonProvider>
          <Routes>
            <Route path="/" element={<SharedLayout />}>
              <Route element={<PrivateRoute redirectTo="/" />}>
                <Route path="/game" element={<GamesListPage />} />
                {/* <Route path="/game/:gameId" element={<CurrentGamePage />} /> */}

                <Route path="/game/:gameId/setup" element={<GameSetup />}>
                  <Route path="prepare-game" element={<PrepareGame />} />
                  <Route path="sort-players" element={<SortPlayers />} />
                  <Route path="select-decks" element={<SelectDecks />} />
                  <Route path="select-decks/:deckId" element={<DeckCards />} />
                </Route>

                <Route
                  path="/game/:gameId/current-game"
                  element={<CurrentGame />}
                />

                <Route path="/set-password" element={<SetPasswordPage />} />
              </Route>

              <Route element={<PublicRoute redirectTo="/game" />}>
                <Route index element={<HomePage />} />

                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
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
        </BackButtonProvider>
      </GoogleOAuthProvider>
    </>
  );
}
