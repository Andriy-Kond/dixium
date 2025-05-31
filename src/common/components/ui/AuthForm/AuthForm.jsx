import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import FormEditInput from "common/components/ui/FormEditInput";

import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import css from "./AuthForm.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { Notify } from "notiflix";
import { useGoogleLoginMutation } from "redux/auth/authApi.js";
import { useGoogleAuth } from "hooks/googleAuth/useGoogleAuth.js";
import { useGoogleLogin } from "@react-oauth/google";
import { setIsSetPassword } from "redux/game/localPersonalSlice.js";
import { selectErrMessage } from "redux/selectors.js";

const initialState = {
  name: "",
  email: "",
  password: "",
};

export default function AuthForm({ isRegister, onSubmit, isDisabled }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };
  const toggleShowPassword = e => {
    e.preventDefault(); // скасовує відкриття списку паролів з кешу браузера
    setShowPassword(prev => !prev);
  };

  const btnText = isRegister ? t("register") : t("login");

  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

  // const [errorMessage, setErrorMessage] = useState(null); // Відстеження конкретних google помилок
  const errorMessage = useSelector(selectErrMessage);

  // Повідомлення після успішної верифікації і перенаправлення з бекенду:
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("verified") === "true") {
      Notify.success(t("email_verified_success"));
      navigate("/login", { replace: true }); // Очистити query-параметри ("verified")
    }
  }, [navigate, t]);

  const handleGoogleLogin = useGoogleAuth();

  // //# Передача token через нативну кнопку:
  // const googleLoginRef = useRef(null); // Референс для GoogleLogin

  //# Передача code (програмно):
  const login = useGoogleLogin({
    onSuccess: handleGoogleLogin,
    onError: error => {
      Notify.failure(t("err_google_login"));
      console.error("Google login error", error);
    },
    flow: "auth-code",
    // flow: "implicit",
    // prompt: "none", // Уникає повторного запиту згоди (але, здається лише з implicit)
    // scope: "email profile openid", // Потрібні scopes
    redirect_uri: "https://dixium.vercel.app",
  });

  const redirectToSetPass = () => {
    dispatch(setIsSetPassword(true)); // Встановити прапор перед входом (перенаправляти користувача на додаткове встановлення паролю після google-авторизації)
    login();
  };
  const handleGoogleAuth = () => {
    // console.log("handleGoogleAuth");
    login();
  };

  return (
    <>
      <form className={css.authForm} onSubmit={onSubmit}>
        {isRegister && (
          <label className={css.formLabel}>
            {t("name")}
            <FormEditInput
              name={"name"}
              placeholder={t("enter_name")}
              value={formData.name}
              onChange={handleChange}
            />
          </label>
        )}

        <label className={css.formLabel}>
          {t("email")}

          <FormEditInput
            name={"email"}
            placeholder={t("enter_email")}
            value={formData?.email}
            onChange={handleChange}
            type="email"
          />
        </label>

        <label className={css.formLabel}>
          {t("password")}

          <div className={css.inputContainer}>
            <FormEditInput
              type={showPassword ? "text" : "password"}
              name={"password"}
              placeholder={t("enter_password")}
              value={formData?.password}
              onChange={handleChange}
            />

            <div
              className={css.showPasswordButton}
              onClick={toggleShowPassword}>
              {showPassword ? (
                <MdVisibility className={css.hideIcon} />
              ) : (
                <MdVisibilityOff className={css.hideIcon} />
              )}
            </div>
          </div>
        </label>

        <button className={css.btn} disabled={isDisabled || isGoogleLoading}>
          {btnText}
        </button>

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
               // console.log("Google Login Failed");
              }}
              text="signin"
            />
          </div> */}

        <button
          className={css.btn}
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}>
          {t("google_login")}
        </button>

        {!isRegister && (
          <Link to="/forgot-password" className={css.forgotPasswordLink}>
            {t("forgot_password")}
          </Link>
        )}
      </form>

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
    </>
  );
}
