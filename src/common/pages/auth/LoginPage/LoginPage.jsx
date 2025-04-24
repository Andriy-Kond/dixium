import { GoogleLogin } from "@react-oauth/google";

import { useDispatch, useSelector } from "react-redux";

import {
  useGoogleLoginMutation,
  useLoginUserMutation,
} from "redux/auth/authApi";
import {
  setIsLoggedIn,
  setUserCredentials,
  // setUserToken,
} from "redux/auth/authSlice";
import {
  selectIsSetPassword,
  selectUserCredentials,
  selectUserIsLoggedIn,
} from "redux/selectors";
import AuthForm from "common/components/ui/AuthForm";
import css from "common/pages/auth/LoginPage/LoginPage.module.scss";
import { Notify } from "notiflix";
import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";
import {
  setIsSetPassword,
  setPageHeaderText,
} from "redux/game/localPersonalSlice.js";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const { t } = useTranslation();
  const isLoggedIn = useSelector(selectUserIsLoggedIn);
  const user = useSelector(selectUserCredentials);

  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

  const [errorMessage, setErrorMessage] = useState(null); // Відстеження конкретних google помилок
  const isSetPassword = useSelector(selectIsSetPassword); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації
  const googleLoginRef = useRef(null); // Референс для GoogleLogin

  useEffect(() => {
    dispatch(setPageHeaderText(t("login")));
    return () => dispatch(setIsSetPassword(false)); // Очистити прапор при демонтажі
  }, [dispatch, t]);

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      const result = await loginUser(userCredentials);
      // console.log("LoginPage >> simple login result:::", result);

      if (result.error) {
        // Notify.failure(result.error.data.message);
        const message = result.error.data.message;
        if (message.includes("registered via Google")) {
          setErrorMessage(message); // Показати помилку для Google
        } else if (message.includes("Too many requests")) {
          Notify.failure(t("too_many_requests"));
        } else {
          Notify.failure(message);
        }
      } else {
        const user = { ...result?.data };
        dispatch(setUserCredentials(user));
        dispatch(setIsLoggedIn(true));
        setErrorMessage(null); // Очистити помилку при успіху
        // dispatch(setUserToken(user.token));

        // const redirectTo = location.state?.from?.pathname || "/game";
        // navigate(redirectTo);

        // Here you can navigate to needed page, if you have it:
        // navigate("/somePrivatPage",  { replace: true });

        // refetch(); // Змушує RTK Query, а саме - getUserByToken зі стану RTK Query робити повторний запит до серверу після логіна
      }
    } catch (err) {
      dispatch(setIsLoggedIn(false));
      Notify.failure(t("err_no_access"));
      console.log("Error: no access", err);
    }
  };

  const handleGoogleLogin = async credentialResponse => {
    try {
      // Відправляємо токен на сервер через RTK Query
      const result = await googleLogin(credentialResponse.credential).unwrap(); // .unwrap() для отримання результату мутації
      // console.log(" LoginPage >> google result:::", result);
      const user = { ...result };
      // console.log(" LoginPage >> google user:::", user);
      dispatch(setUserCredentials(user));
      // dispatch(setUserToken(user.token));
      dispatch(setIsLoggedIn(true));

      if (isSetPassword) navigate("/set-password"); // Перенаправлення, якщо прапор увімкнено
    } catch (err) {
      Notify.failure(t("err_google_login"));
      console.log("Google Login Error:", err.message);
    }
  };

  const setRedirectToSetPass = () => {
    dispatch(setIsSetPassword(true)); // Встановити прапор перед входом
  };

  return (
    <>
      {!isLoggedIn && (
        <div className={css.container}>
          {/* <div className={css.pageHeader}>
            <p className={css.pageHeader_title}>{t("enter")}</p>
          </div> */}

          <div className={css.pageMain}>
            <div
              className={css.googleLoginContainer}
              style={{
                pointerEvents: isGoogleLoading ? "none" : "auto",
                opacity: isGoogleLoading ? 0.5 : 1,
              }}>
              <GoogleLogin
                onSuccess={handleGoogleLogin} // Отримуємо токен Google
                onError={() => {
                  Notify.failure(t("err_google_login"));
                  console.log("Google Login Failed");
                }}
                text="signin" //??? які є варіанти написів у гугла? як міняти мову в них?
                // "signin": "Вхід"
                // "signin_with": "Вхід через Google" (default)
                // "signup_with": "Зареєструватися через Google".
                // "continue_with": "Продовжити з Google".
              />
            </div>
            <button
              onClick={() =>
                googleLoginRef.current.querySelector("button")?.click()
              }
              className={css.customButton}>
              {t("custom_google_login_text")}{" "}
              {/* Наприклад, "Увійти через Google" */}
            </button>

            {errorMessage?.includes("registered via Google") && (
              <div className={css.errorContainer}>
                <p>{t("google_account_error")}</p>

                <p>{t("usual_google_login")}</p>
                <div
                  className={css.googleLoginContainer}
                  style={{
                    pointerEvents: isGoogleLoading ? "none" : "auto",
                    opacity: isGoogleLoading ? 0.5 : 1,
                  }}>
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      Notify.failure(t("err_google_login"));
                      console.log("Google Login Failed");
                    }}
                    text="signin"
                  />
                </div>

                <div onClick={setRedirectToSetPass}>
                  <p>{t("login_and_set_password")}</p>

                  <div
                    className={css.googleLoginContainer}
                    style={{
                      pointerEvents: isGoogleLoading ? "none" : "auto",
                      opacity: isGoogleLoading ? 0.5 : 1,
                    }}>
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => {
                        Notify.failure(t("err_google_login"));
                        console.log("Google Login Failed");
                      }}
                      text="signin"
                    />
                  </div>
                </div>
              </div>
            )}

            <AuthForm
              isRegister={false}
              onSubmit={submitCredentials}
              isDisabled={isLoginLoading}
            />
            <div className={css.pageFooter}></div>
          </div>
        </div>
      )}

      {isLoggedIn && <div>{t("welcome_user", { user: user.name })}</div>}
    </>
  );
}
