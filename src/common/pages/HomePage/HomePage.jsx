import { useDispatch, useSelector } from "react-redux";
import { useGoogleLogin } from "@react-oauth/google";
import { setTheme, setVisualTheme } from "redux/game/localPersonalSlice.js";
import { selectTheme } from "redux/selectors.js";
import { DARK, LIGHT } from "utils/generals/constants.js";
import { useState } from "react";
import { useGoogleLoginMutation } from "redux/auth/authApi.js";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Notify } from "notiflix";

import { ReactComponent as GameNameSvg } from "imgs/name_tixid.svg";
import { ReactComponent as GameSloganSvg } from "imgs/game_slogan.svg";
import { ReactComponent as GameLogoLightSvg } from "imgs/logo_tixid_light_theme.svg";
import { ReactComponent as GameLogoDarkSvg } from "imgs/logo_tixid_dark_theme.svg";

import css from "./HomePage.module.scss";
import clsx from "clsx";
import { useGoogleAuth } from "hooks/googleAuth/useGoogleAuth.js";

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const { t } = useTranslation();

  const [googleLogin, { isLoading: isGoogleLoading }] =
    useGoogleLoginMutation();

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
    redirect_uri: "https://dixium.vercel.app",
  });

  const handleGoogleAuth = () => {
    // console.log("handleGoogleAuth");
    login();
  };

  return (
    <div className={css.homePageContainer}>
      {/* <div className={css.gameBgHeader} /> */}
      <div className={css.gameBg}>
        <GameNameSvg className={css.gameName} />
        <GameSloganSvg className={css.gameSlogan} />

        <div className={css.gameLogo} onClick={handleToggleTheme}>
          {theme === LIGHT ? <GameLogoLightSvg /> : <GameLogoDarkSvg />}
        </div>
        <div className={css.logoShadow} />

        <button
          className={clsx(css.btn, css.homePageGoogleLoginBtn)}
          onClick={handleGoogleAuth}
          disabled={isGoogleLoading}>
          {t("login_with_google")}
        </button>

        <div className={css.homePageAuthContainer}>
          {isHaveGoogleAcc ? (
            <button
              className={css.activeBtnLink}
              onClick={handleIsHaveGoogleAcc}>
              <span>{t("not_have_google_acc?")}</span>
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
      {/* <div className={css.gameBgFooter} /> */}
    </div>
  );
}
