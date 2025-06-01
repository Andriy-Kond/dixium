import { useDispatch, useSelector } from "react-redux";
import { useLoginUserMutation } from "redux/auth/authApi";
import { setIsLoggedIn, setUserCredentials } from "redux/auth/authSlice";

import AuthForm from "common/components/ui/AuthForm";
import css from "common/pages/auth/LoginPage/LoginPage.module.scss";
import { Notify } from "notiflix";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import {
  setErrMessage,
  setIsSetPassword,
  setPageHeaderText,
  setPageHeaderTextSecond,
  setUserActiveGameId,
} from "redux/game/localPersonalSlice.js";
import { useNavigate } from "react-router-dom";
import { selectErrMessage } from "redux/selectors.js";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const { t } = useTranslation();

  const err = useSelector(selectErrMessage);
  const [loginUser, { isLoading: isLoginLoading }] = useLoginUserMutation();

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(t("login")));
    dispatch(setPageHeaderTextSecond(""));
    return () => dispatch(setIsSetPassword(false)); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації
  }, [dispatch, t]);

  // Вхід через AuthForm
  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      // console.log("loginUser");
      const result = await loginUser(userCredentials).unwrap();

      dispatch(setUserCredentials(result));
      dispatch(setUserActiveGameId(result?.userActiveGameId));
      dispatch(setIsLoggedIn(true));
      dispatch(setErrMessage(null)); // Очистити помилку при успіху
    } catch (err) {
      console.log("LoginPage >> err:::", err);
      console.log(`Socket connect_error: ${JSON.stringify(err, null, 2)}`);
      const message =
        err?.data?.message ||
        t("err_no_access", { err: JSON.stringify(err, null, 2) });
      // dispatch(setErrMessage(null));
      if (message?.includes("registered via Google")) {
        dispatch(setErrMessage(message)); // Показати помилку для Google
      } else if (message?.includes("Email not verified")) {
        navigate("/verify-email");
      } else if (message?.includes("Too many requests")) {
        Notify.failure(t("too_many_requests"));
      } else {
        Notify.failure(message);
        dispatch(setIsLoggedIn(false));
        // console.log("Error: no access", err);
      }
    }
  };

  return (
    <>
      <div className={css.container}>
        {err && <div>{`${err}`}</div>}
        <AuthForm
          isRegister={false}
          onSubmit={submitCredentials}
          isDisabled={isLoginLoading}
        />

        <div className={css.pageFooter} />
      </div>
    </>
  );
}
