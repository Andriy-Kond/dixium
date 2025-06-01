import { useDispatch } from "react-redux";
import { useSignupUserMutation } from "redux/auth/authApi";
import { setIsLoggedIn, setUserCredentials } from "redux/auth/authSlice";

import AuthForm from "common/components/ui/AuthForm";
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

import css from "common/pages/auth/RegisterPage/RegisterPage.module.scss";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const { t } = useTranslation();
  const [signupUser, { isLoading: isSignupLoading }] = useSignupUserMutation();

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(t("register")));
    dispatch(setPageHeaderTextSecond(""));

    return () => dispatch(setIsSetPassword(false)); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації
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
      dispatch(setErrMessage(null)); // Очистити помилку при успіху
      Notify.success(t("registration_success"));
    } catch (err) {
      const message = err.data?.message || t("err_no_access");
      if (message.includes("registered via Google")) {
        dispatch(setErrMessage(message));
      } else if (
        message.includes("Email already registered but not verified")
      ) {
        navigate("/verify-email");
      } else if (message.includes("Too many requests")) {
        Notify.failure(t("too_many_requests"));
      } else {
        Notify.failure(message);
        dispatch(setIsLoggedIn(false));
        // console.log("Error: no access", err);
      }
    }
  };

  return (
    <div className={css.container}>
      <AuthForm
        isRegister={true}
        onSubmit={submitCredentials}
        isDisabled={isSignupLoading}
      />

      <div className={css.pageFooter} />
    </div>
  );
}
