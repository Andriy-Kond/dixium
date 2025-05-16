import { useDispatch, useSelector } from "react-redux";
import { GoogleLogin } from "@react-oauth/google";
import {
  setUserActiveGameId,
  toggleTheme,
} from "redux/game/localPersonalSlice.js";
import { selectIsSetPassword, selectTheme } from "redux/selectors.js";
import { LIGHT } from "utils/generals/constants.js";
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
import { MdArrowForwardIos } from "react-icons/md";
import css from "./HomePage.module.scss";

// import { ReactComponent as mainPageBg } from "/imgs/mainPageBg_light_theme.png";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const { t } = useTranslation();

  const theme = useSelector(selectTheme);
  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

  const isSetPassword = useSelector(selectIsSetPassword); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації

  const [isHaveGoogleAcc, setIsHaveGoogleAcc] = useState(true);
  console.log(" HomePage >> isHaveGoogleAcc:::", isHaveGoogleAcc);

  const handleIsHaveGoogleAcc = () => {
    if (isHaveGoogleAcc) setIsHaveGoogleAcc(false);
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const googleLoginRef = useRef(null); // Референс для GoogleLogin
  const handleGoogleLogin = async credentialResponse => {
    try {
      // Відправляємо токен на сервер через RTK Query
      const result = await googleLogin(credentialResponse.credential).unwrap(); // .unwrap() для отримання результату мутації - data чи error
      console.log("LoginPage >> google result:::", result);

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
      <div
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
      </div>
      <button
        className={css.homePageGoogleLoginBtn}
        style={
          theme === LIGHT
            ? { "--btnBgColor": "#2b3847", "--btnTextColor": "#e3e7e9" }
            : { "--btnBgColor": "#e3e7e9", "--btnTextColor": "#2b3847" }
        }
        onClick={() =>
          googleLoginRef.current?.querySelector("div[role=button]")?.click()
        }>
        {t("login_with_google")}
      </button>

      <div className={css.homePageAuthContainer}>
        {isHaveGoogleAcc ? (
          <button className={css.activeBtnLink} onClick={handleIsHaveGoogleAcc}>
            <span>{t("not_have_google_acc?")}</span>
            {/* <MdArrowForwardIos className={css.btnLinkIcon} /> */}
          </button>
        ) : (
          <>
            <button
              className={css.homePageAuthBtn}
              style={
                theme === LIGHT
                  ? { "--btnBgColor": "#2b3847", color: "#e3e7e9" }
                  : { "--btnBgColor": "#e3e7e9", color: "#2b3847" }
              }
              onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className={css.homePageAuthBtn}
              style={
                theme === LIGHT
                  ? { "--btnBgColor": "#2b3847", color: "#e3e7e9" }
                  : { "--btnBgColor": "#e3e7e9", color: "#2b3847" }
              }
              onClick={() => navigate("/register")}>
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}
