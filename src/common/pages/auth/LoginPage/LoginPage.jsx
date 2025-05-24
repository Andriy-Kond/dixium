import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
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
import { useEffect, useRef, useState } from "react";
import {
  setIsSetPassword,
  setPageHeaderText,
  setPageHeaderTextSecond,
  setUserActiveGameId,
} from "redux/game/localPersonalSlice.js";
import { useNavigate } from "react-router-dom";
import { useGoogleAuth } from "hooks/googleAuth/useGoogleAuth.js";

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

  // Повідомлення після успішної верифікації і перенаправлення з бекенду:
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("verified") === "true") {
      Notify.success(t("email_verified_success"));
      navigate("/login", { replace: true }); // Очистити query-параметри ("verified")
    }
  }, [navigate, t]);

  // Вхід через AuthForm
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

  const handleGoogleLogin = useGoogleAuth();

  //# Передача token через нативну кнопку:
  const googleLoginRef = useRef(null); // Референс для GoogleLogin

  //# Передача code (програмно):
  const login = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: error => {
      Notify.failure(t("err_google_login"));
      console.error("Google login error", error);
    },
    flow: "auth-code",
    // flow: "implicit",
    prompt: "none", // Уникає повторного запиту згоди (але, здається лише з implicit)
    // scope: "email profile openid", // Потрібні scopes
    redirect_uri: "https://dixium.vercel.app",
  });

  const redirectToSetPass = () => {
    dispatch(setIsSetPassword(true)); // Встановити прапор перед входом
    login();
  };

  const handleGoogleAuth = () => {
    console.log("handleGoogleAuth");
    login();
  };

  return (
    <>
      <div className={css.container}>
        <div className={css.pageMain}>
          {/* <div
            ref={googleLoginRef}
            className={css.googleLoginContainer}
            style={{
              // pointerEvents: isGoogleLoading ? "none" : "auto",
              opacity: isGoogleLoading ? 0.5 : 1,
            }}>
            <GoogleLogin
              style={{ display: "none !important" }}
              onSuccess={handleGoogleLogin} // Отримуємо токен Google
              onError={() => {
                Notify.failure(t("err_google_login"));
                console.log("Google Login Failed");
              }}
              text="signin" //??? які є варіанти написів у гугла? як міняти мову в них?
            />
          </div> */}

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
