import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import {
  setIsSetPassword,
  setTheme,
  setUserActiveGameId,
  setVisualTheme,
} from "redux/game/localPersonalSlice.js";
import { selectIsSetPassword, selectTheme } from "redux/selectors.js";
import { DARK, LIGHT } from "utils/generals/constants.js";
import { useRef, useState } from "react";
import { useGoogleLoginMutation } from "redux/auth/authApi.js";
import { setIsLoggedIn, setUserCredentials } from "redux/auth/authSlice.js";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Notify } from "notiflix";

import { ReactComponent as GameNameSvg } from "imgs/name_tixid.svg";
import { ReactComponent as GameSloganSvg } from "imgs/game_slogan.svg";

import bgLight from "imgs/mainPageBg_light_theme.png";
import bgDark from "imgs/mainPageBg_dark_theme.png";
import css from "./HomePage.module.scss";
import clsx from "clsx";
import { useGoogleAuth } from "hooks/googleAuth/useGoogleAuth.js";

// import { ReactComponent as mainPageBg } from "/imgs/mainPageBg_light_theme.png";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const { t } = useTranslation();

  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

  const [errorMessage, setErrorMessage] = useState(null); // Відстеження конкретних google помилок

  const isSetPassword = useSelector(selectIsSetPassword); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації

  const [isHaveGoogleAcc, setIsHaveGoogleAcc] = useState(true);

  const handleIsHaveGoogleAcc = () => {
    if (isHaveGoogleAcc) setIsHaveGoogleAcc(false);
  };

  const theme = useSelector(selectTheme);
  const handleToggleTheme = () => {
    const newTheme = theme === LIGHT ? DARK : LIGHT;

    dispatch(setTheme(newTheme)); // зміна теми
    dispatch(setVisualTheme(newTheme)); // зміна візуала теми
  };

  const handleGoogleLogin = useGoogleAuth();

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
    dispatch(setIsSetPassword(true)); // Встановити прапор перед входом
    login();
  };

  const handleGoogleAuth = () => {
    // console.log("handleGoogleAuth");
    // console.log("Redirect URI - 2:", window.location.origin);
    login();
  };

  return (
    <div className={css.homePageContainer}>
      <div
        className={css.gameBg}
        style={{
          "--bgImage": `url(${theme === LIGHT ? bgLight : bgDark})`,
        }}></div>

      <GameNameSvg className={css.gameName} />
      <GameSloganSvg className={css.gameSlogan} />

      <img
        className={css.gameLogo}
        src={
          theme === LIGHT
            ? "/imgs/logo_tixid_light_theme.svg"
            : "/imgs/logo_tixid_dark_theme.svg"
        }
        alt="logo"
        onClick={handleToggleTheme}
      />

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
          text="signin" //??? які є варіанти написів у гугла? як міняти мову в них?
          // "signin": "Вхід"
          // "signin_with": "Вхід через Google" (default)
          // "signup_with": "Зареєструватися через Google".
          // "continue_with": "Продовжити з Google".
        />
      </div> */}

      {/* <button
        className={clsx(css.btn, css.homePageGoogleLoginBtn)}
        onClick={() =>
          googleLoginRef.current?.querySelector("div[role=button]")?.click()
        }>
        {t("login_with_google")}
      </button> */}

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

      <button
        className={clsx(css.btn, css.homePageGoogleLoginBtn)}
        onClick={handleGoogleAuth}
        disabled={isGoogleLoading}>
        {t("google_login")}
      </button>

      <div className={css.homePageAuthContainer}>
        {isHaveGoogleAcc ? (
          <button className={css.activeBtnLink} onClick={handleIsHaveGoogleAcc}>
            <span>{t("not_have_google_acc?")}</span>
            {/* <MdArrowForwardIos className={css.btnLinkIcon} /> */}
          </button>
        ) : (
          <>
            <button className={css.btn} onClick={() => navigate("/login")}>
              Login
            </button>
            <button className={css.btn} onClick={() => navigate("/register")}>
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}
