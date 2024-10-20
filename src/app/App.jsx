import { Route, Routes } from "react-router-dom";
import { lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectUserToken } from "./selectors";
import { HomePage, SharedLayout } from "common/pages";
import PrivateRoute from "common/components/navigation/PvivateRoute";
import PublicRoute from "common/components/navigation/PublicRoute";

import { setIsLoggedIn } from "features/auth/authSlice";
import { useGetUserByTokenQuery } from "features/users/usersSlice";

import { players } from "resources/players";
import { deck } from "resources/decks";

const ContactsPage = lazy(() => import("common/pages/ContactsPage"));
const RegisterPage = lazy(() => import("common/pages/RegisterPage"));
const LoginPage = lazy(() => import("common/pages/LoginPage"));
const NotFoundPage = lazy(() => import("common/pages/NotFoundPage"));

export default function App() {
  const dispatch = useDispatch();
  const authUserToken = useSelector(selectUserToken);

  const { isSuccess, isFetching } = useGetUserByTokenQuery(undefined, {
    skip: !authUserToken, // Пропускає запит, якщо токен відсутній
  });

  useEffect(() => {
    if (isSuccess) {
      dispatch(setIsLoggedIn(true));
    } else {
      dispatch(setIsLoggedIn(false));
    }
  }, [dispatch, isSuccess]);

  const shuffleDeck = deck => {
    return deck
      .map(card => ({ card, sortIndex: Math.random() })) // Додати випадковий індекс
      .sort((a, b) => a.sortIndex - b.sortIndex) // Сортування за цим індексом
      .map(({ card }) => card); // Повертаю тільки карти
  };

  const newDeck = shuffleDeck(deck);

  return (
    <>
      {/* Перевірка !isFetching && - щоб при залогіненому користувачі не мигала спочатку сторінка Login і потім Contacts */}
      {!isFetching && (
        <Routes>
          <Route path="/" element={<SharedLayout />}>
            <Route index element={<HomePage />} />

            <Route element={<PrivateRoute redirectTo="/login" />}>
              <Route path="/contacts" element={<ContactsPage />} />
            </Route>

            <Route element={<PublicRoute redirectTo="/contacts" />}>
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
