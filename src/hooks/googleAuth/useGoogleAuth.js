import { useGoogleLogin } from "@react-oauth/google";
import { Notify } from "notiflix";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGoogleLoginMutation } from "redux/auth/authApi.js";
import { setIsLoggedIn, setUserCredentials } from "redux/auth/authSlice.js";
import { setUserActiveGameId } from "redux/game/localPersonalSlice.js";
import { selectIsSetPassword } from "redux/selectors.js";

export const useGoogleAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const { t } = useTranslation();

  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

  const isSetPassword = useSelector(selectIsSetPassword); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації

  // Обробник - передача або token, або code
  const handleGoogleLogin = useCallback(
    async response => {
      try {
        // Відправляємо токен на сервер через RTK Query
        const result = await googleLogin({
          token: response.credential,
          code: response.code,
        }).unwrap(); // .unwrap() для отримання результату мутації - data чи error

        dispatch(setUserCredentials(result));
        dispatch(setUserActiveGameId(result?.userActiveGameId));
        dispatch(setIsLoggedIn(true));

        if (isSetPassword) navigate("/set-password"); // Перенаправлення, якщо прапор увімкнено
      } catch (err) {
        const message = err.data?.message || t("err_google_login");
        if (message.includes("Email not verified")) {
          navigate("/verify-email");
        } else {
          Notify.failure(t("err_google_login"));
          console.log("Google Login Error:", err.message);
        }
      }
    },
    [dispatch, googleLogin, isSetPassword, navigate, t],
  );

  // //# Передача code (програмно):
  // const login = useGoogleLogin({
  //   onSuccess: handleGoogleLogin,
  //   onError: error => {
  //     Notify.failure(t("err_google_login"));
  //     console.error("Google login error", error);
  //   },
  //   flow: "auth-code",
  //   // flow: "implicit",
  //   prompt: "none", // Уникає повторного запиту згоди (але, здається лише з implicit)
  //   // scope: "email profile openid", // Потрібні scopes
  // });
  return handleGoogleLogin;
};
