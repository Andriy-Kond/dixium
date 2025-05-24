import { useGoogleLogin } from "@react-oauth/google";
import { useDispatch, useSelector } from "react-redux";
import {
  useGoogleLoginMutation,
  useLoginUserMutation,
} from "redux/auth/authApi";
import { setIsLoggedIn, setUserCredentials } from "redux/auth/authSlice";
import { selectIsSetPassword } from "redux/selectors";
import AuthForm from "common/components/ui/AuthForm";
import css from "common/pages/auth/LoginPage/LoginPage.module.scss";
import { Notify } from "notiflix";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  setIsSetPassword,
  setPageHeaderText,
  setPageHeaderTextSecond,
  setUserActiveGameId,
} from "redux/game/localPersonalSlice.js";
import { useNavigate } from "react-router-dom";
import Button from "common/components/ui/Button";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const { t } = useTranslation();

  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

  const [errorMessage, setErrorMessage] = useState(null); // Відстеження конкретних google помилок
  const isSetPassword = useSelector(selectIsSetPassword); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(t("login")));
    dispatch(setPageHeaderTextSecond(""));
    return () => dispatch(setIsSetPassword(false)); // Очистити прапор при демонтажі
  }, [dispatch, t]);

  useEffect(() => {
    // Повідомлення після успішної верифікації і перенаправлення з бекенду:
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("verified") === "true") {
      Notify.success(t("email_verified_success"));
      navigate("/login", { replace: true }); // Очистити query-параметри ("verified")
    }
  }, [navigate, t]);

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      console.log("loginUser");
      const result = await loginUser(userCredentials).unwrap();

      dispatch(setUserCredentials(result));
      dispatch(setUserActiveGameId(result?.userActiveGameId));
      dispatch(setIsLoggedIn(true));
      setErrorMessage(null); // Очистити помилку при успіху
    } catch (err) {
      const message = err?.data.message || t("err_no_access");
      if (message.includes("registered via Google")) {
        setErrorMessage(message); // Показати помилку для Google
      } else if (message.includes("Email not verified")) {
        navigate("/verify-email");
      } else if (message.includes("Too many requests")) {
        Notify.failure(t("too_many_requests"));
      } else {
        Notify.failure(message);
        dispatch(setIsLoggedIn(false));
        console.log("Error: no access", err);
      }
    }
  };

  // Хук для програмного виклику Google Sign-In
  const login = useGoogleLogin({
    onSuccess: async credentialResponse => {
      console.log(" LoginPage >> credentialResponse:::", credentialResponse);
      try {
        // Відправляємо токен на сервер через RTK Query
        const result = await googleLogin(
          credentialResponse.credential ||
            credentialResponse.access_token ||
            credentialResponse.code,
        ).unwrap(); // .unwrap() для отримання результату мутації - data чи error
        console.log(" LoginPage >> result:::", result);
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
          console.log("Google Login Error:", err);
        }
      }
    },
    onError: error => {
      Notify.failure(t("err_google_login"));
      console.error("Google login error", error);
    },
    // Вказуємо потрібні scopes
    scope: "email profile openid", // Обов’язкові scopes для Google Sign-In
    flow: "implicit", // Використовуємо implicit flow для отримання ID Token
    // responseType: "id_token", // Явно вказуємо, що хочемо ID Token
    // prompt: "none", // Уникає повторного запиту згоди
  });

  const redirectToSetPass = () => {
    dispatch(setIsSetPassword(true)); // Встановити прапор перед входом
    login(); // Програмний виклик Google Sign-In
  };

  const handleGoogleAuth = () => {
    console.log("handleGoogleAuth");
    login(); // Програмний виклик Google Sign-In
  };

  return (
    <>
      <div className={css.container}>
        <div className={css.pageMain}>
          {errorMessage?.includes("registered via Google") && (
            <div className={css.errorContainer}>
              <p>{t("google_account_error")}</p>

              <div
                className={css.googleLoginContainer}
                style={{
                  pointerEvents: isGoogleLoading ? "none" : "auto",
                  opacity: isGoogleLoading ? 0.5 : 1,
                }}>
                <button className={css.btn} onClick={handleGoogleAuth}>
                  {t("usual_google_login")}
                </button>
              </div>

              <div
                className={css.googleLoginContainer}
                style={{
                  pointerEvents: isGoogleLoading ? "none" : "auto",
                  opacity: isGoogleLoading ? 0.5 : 1,
                }}>
                <button className={css.btn} onClick={redirectToSetPass}>
                  {t("login_and_set_password")}
                </button>
              </div>
            </div>
          )}

          <AuthForm
            isRegister={false}
            onSubmit={submitCredentials}
            isDisabled={isGoogleLoading || isLoginLoading}
          />

          <button
            className={css.btn}
            onClick={handleGoogleAuth}
            disabled={isGoogleLoading}>
            {t("google_login")}
          </button>

          <div className={css.pageFooter} />
        </div>
      </div>
    </>
  );
}
