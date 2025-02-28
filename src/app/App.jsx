import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectUserCredentials, selectUserToken } from "./selectors";
import HomePage from "common/pages/HomePage";
import SharedLayout from "common/pages/SharedLayout";

import PrivateRoute from "common/components/navigation/PvivateRoute";
import PublicRoute from "common/components/navigation/PublicRoute";

import { setIsLoggedIn } from "features/auth/authSlice";
import { useGetUserByTokenQuery } from "features/users/usersApi";
import Notiflix from "notiflix";

import { useSetupSocketListeners } from "features/hooks/useSetupSocketListeners.js";
import socket from "socket.js";

Notiflix.Notify.init({
  clickToClose: true,
});

const RegisterPage = lazy(() => import("common/pages/RegisterPage"));
const LoginPage = lazy(() => import("common/pages/LoginPage"));
const GameInitialPage = lazy(() => import("common/pages/GameInitialPage"));
const GameStartedPage = lazy(() => import("common/pages/GameStartedPage"));
const NotFoundPage = lazy(() => import("common/pages/NotFoundPage"));

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const match = location.pathname.match(/game\/([\w\d]+)/);
  const currentGameId = match ? match[1] : null;

  const userCredentials = useSelector(selectUserCredentials);

  const authUserToken = useSelector(selectUserToken);
  const { isSuccess, isFetching } = useGetUserByTokenQuery(undefined, {
    skip: !authUserToken, // Пропускає запит, якщо токен відсутній
  });

  useSetupSocketListeners(); // Підписка на всі слухачі сокетів

  // useEffect(() => {
  //   // При підключенні або оновленні сторінки приєднуємося до кімнати
  //   if (socket.connected && currentGameId && userCredentials._id) {
  //     socket.emit("joinGameRoom", {
  //       gameId: currentGameId,
  //       userId: userCredentials._id,
  //     });
  //   }

  //   // Логування для дебагу
  //   socket.on("connect", () => {
  //     console.log("Connected to socket, joining room:", currentGameId);
  //     if (socket.connected && currentGameId && userCredentials._id) {
  //       socket.emit("joinGameRoom", {
  //         gameId: currentGameId,
  //         userId: userCredentials._id,
  //       });
  //     }
  //   });

  //   socket.on("reconnect", () => {
  //     console.log("Reconnected to socket, rejoining room:", currentGameId);
  //     socket.emit("joinGameRoom", {
  //       gameId: currentGameId,
  //       userId: userCredentials._id,
  //     });
  //   });

  //   return () => {
  //     // Опціонально: залишити кімнату при розмонтуванні (якщо потрібно)
  //     // socket.emit("leaveGameRoom", { gameId: currentGameId, userId: userCredentials._id });
  //   };
  // }, [currentGameId, userCredentials._id]);

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
      {!isFetching && (
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route index element={<HomePage />} />

            <Route element={<PrivateRoute redirectTo="/login" />}>
              <Route
                path="/game/:currentGameId"
                element={<GameStartedPage />}
              />
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
    </>
  );
}
