import { useDispatch } from "react-redux";
import { useSignupUserMutation } from "redux/auth/authApi";
import {
  setIsLoggedIn,
  setUserCredentials,
  // setUserToken,
} from "redux/auth/authSlice";

import AuthForm from "common/components/ui/AuthForm";
import css from "common/pages/auth/RegisterPage/RegisterPage.module.scss";
import { Notify } from "notiflix";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { setPageHeaderText } from "redux/game/localPersonalSlice.js";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [signupUser] = useSignupUserMutation();

  const navigate = useNavigate(); // Для перенаправлення на сторінку з встановлення логіну, якщо користувач авторизований раніше по google
  const [errorMessage, setErrorMessage] = useState(null); // Відстеження конкретних google помилок

  useEffect(() => {
    dispatch(setPageHeaderText(t("register")));
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

  return (
    <div className={css.container}>
      {/* <div className={css.pageHeader}>
        <p className={css.pageHeader_title}>{t("register")}</p>
      </div> */}

      <div className={css.pageMain}>
        {errorMessage?.includes("registered via Google") && (
          <div className={css.errorContainer}>
            <p>{t("google_account_error_register")}</p>

            <button
              onClick={() => navigate("/login")}
              className={css.actionButton}>
              {t("go_to_login")}
            </button>
          </div>
        )}

        <AuthForm isRegister={true} onSubmit={submitCredentials} />
        <div className={css.pageFooter}></div>
      </div>
    </div>
  );
}
