import { useDispatch, useSelector } from "react-redux";
import {
  useGoogleLoginMutation,
  useSignupUserMutation,
} from "redux/auth/authApi";
import {
  setIsLoggedIn,
  setUserCredentials,
  // setUserToken,
} from "redux/auth/authSlice";

import AuthForm from "common/components/ui/AuthForm";
import css from "common/pages/auth/RegisterPage/RegisterPage.module.scss";
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
import Button from "common/components/ui/Button/index.js";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { selectIsSetPassword } from "redux/selectors.js";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [signupUser, { isLoading: isSignupLoading }] = useSignupUserMutation();

  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const [errorMessage, setErrorMessage] = useState(null); // Відстеження конкретних google помилок
  const googleLoginRef = useRef(null); // Референс для GoogleLogin
  const isSetPassword = useSelector(selectIsSetPassword); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації
  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(t("register")));
    dispatch(setPageHeaderTextSecond(""));
  }, [dispatch, t]);

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      const result = await signupUser(userCredentials).unwrap();
      // console.log(" RegisterPage >> result:::", result);
      dispatch(setUserCredentials(result));
      dispatch(setUserActiveGameId(result?.userActiveGameId));
      dispatch(setIsLoggedIn(true));
      form.reset();
      setErrorMessage(null); // Очистити помилку при успіху
      Notify.success(t("registration_success"));

      // dispatch(setUserToken(user.token));

      // Here you can immediately come to private route:
      // and/or navigate to needed page:
      // navigate("/somePrivatPage",  { replace: true });
      // Якщо вказати значення true, то новий лист підмінить собою найвищий. Це використовується досить рідко, наприклад при логіні, щоб користувач не зміг повернутися кнопкою «назад» на сторінку логіна після входу, адже він уже в системі і робити йому там нічого.

      // Or you can switch to login page after registration:
      // navigate("/login");
    } catch (err) {
      // Notify.failure(result.error.data.message);
      const message = err.data?.message || t("err_no_access");
      if (message.includes("registered via Google")) {
        setErrorMessage(message);
      } else if (
        message.includes("Email already registered but not verified")
      ) {
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
    onSuccess: async tokenResponse => {
      try {
        // Відправляємо токен на сервер через RTK Query
        const result = await googleLogin(tokenResponse).unwrap(); // .unwrap() для отримання результату мутації - data чи error
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
    onError: error => {
      Notify.failure(t("err_google_login"));
      console.error("Google login error", error);
    },
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
    <div className={css.container}>
      {/* <div
        ref={googleLoginRef}
        className={css.googleLoginContainer}
        style={{
          // pointerEvents: isGoogleLoading ? "none" : "auto",
          opacity: isGoogleLoading ? 0.5 : 1,
          display: "none",
        }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin} // Отримуємо токен Google
          onError={() => {
            Notify.failure(t("err_google_login"));
            console.log("Google Login Failed");
          }}
          text="signin"
          // "signin": "Вхід"
          // "signin_with": "Вхід через Google" (default)
          // "signup_with": "Зареєструватися через Google".
          // "continue_with": "Продовжити з Google".
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
            {/* <Button
              onClick={() =>
                googleLoginRef.current
                  ?.querySelector("div[role=button]")
                  ?.click()
              }>
              {t("usual_google_login")}
            </Button> */}
            <Button onClick={handleGoogleAuth}>
              {t("usual_google_login")}
            </Button>
          </div>

          {/* <div onClick={redirectToSetPass}>
            <div
              className={css.googleLoginContainer}
              style={{
                pointerEvents: isGoogleLoading ? "none" : "auto",
                opacity: isGoogleLoading ? 0.5 : 1,
              }}>
              <Button
                onClick={() =>
                  googleLoginRef.current
                    ?.querySelector("div[role=button]")
                    ?.click()
                }>
                {t("login_and_set_password")}
              </Button>
            </div>
          </div> */}
          <div
            className={css.googleLoginContainer}
            style={{
              pointerEvents: isGoogleLoading ? "none" : "auto",
              opacity: isGoogleLoading ? 0.5 : 1,
            }}>
            <Button onClick={redirectToSetPass}>
              {t("login_and_set_password")}
            </Button>
          </div>
        </div>
      )}

      <AuthForm
        isRegister={true}
        onSubmit={submitCredentials}
        isDisabled={isGoogleLoading || isSignupLoading}
      />
      {/* <button
        className={css.btn}
        onClick={() =>
          googleLoginRef.current?.querySelector("div[role=button]")?.click()
        }>
        {t("register_with_google")}
      </button> */}

      <button
        className={css.btn}
        onClick={handleGoogleAuth}
        disabled={isGoogleLoading}>
        {t("register_with_google")}
      </button>

      <div className={css.pageFooter} />
    </div>
  );
}
