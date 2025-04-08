import { useDispatch } from "react-redux";
import { useSignupUserMutation } from "redux/auth/authApi";
import {
  setIsLoggedIn,
  setUserCredentials,
  setUserToken,
} from "redux/auth/authSlice";

import AuthForm from "common/components/ui/AuthForm";
import css from "common/components/ui/AuthForm/AuthForm.module.scss";
import { Notify } from "notiflix";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { setPageHeaderText } from "redux/game/localPersonalSlice.js";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [signupUser] = useSignupUserMutation();

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
      const result = await signupUser(userCredentials);

      if (result.error) {
        Notify.failure(result.error.data.message);
      } else {
        const user = { ...result?.data };
        dispatch(setUserCredentials(user));
        dispatch(setUserToken(user.token));

        form.reset();

        // Here you can immediately come to private route:
        dispatch(setIsLoggedIn(true));
        // and/or navigate to needed page:
        // navigate("/somePrivatPage",  { replace: true });
        // Якщо вказати значення true, то новий лист підмінить собою найвищий. Це використовується досить рідко, наприклад при логіні, щоб користувач не зміг повернутися кнопкою «назад» на сторінку логіна після входу, адже він уже в системі і робити йому там нічого.

        // Or you can switch to login page after registration:
        // navigate("/login");
      }
    } catch (err) {
      dispatch(setIsLoggedIn(false));
      Notify.failure(t("err_no_access"));
      console.log("Error: no access", err);
    }
  };

  return (
    <div className={css.container}>
      {/* <div className={css.pageHeader}>
        <p className={css.pageHeader_title}>{t("register")}</p>
      </div> */}

      <div className={css.pageMain}>
        <AuthForm isRegister={true} onSubmit={submitCredentials} />
        <div className={css.pageFooter}></div>
      </div>
    </div>
  );
}
