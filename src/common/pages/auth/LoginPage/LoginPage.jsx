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
import { selectUserCredentials, selectUserIsLoggedIn } from "redux/selectors";
import AuthForm from "common/components/ui/AuthForm";
import css from "common/pages/auth/LoginPage/LoginPage.module.scss";
import { Notify } from "notiflix";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { setPageHeaderText } from "redux/game/localPersonalSlice.js";

export default function LoginPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const isLoggedIn = useSelector(selectUserIsLoggedIn);
  const user = useSelector(selectUserCredentials);
  const [loginUser] = useLoginUserMutation();
  const [googleLogin] = useGoogleLoginMutation();

  useEffect(() => {
    dispatch(setPageHeaderText(t("login")));
  }, [dispatch, t]);

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      const result = await loginUser(userCredentials);
      console.log(" LoginPage >> simple login result:::", result);

      if (result.error) {
        Notify.failure(result.error.data.message);
      } else {
        const user = { ...result?.data };
        dispatch(setUserCredentials(user));
        // dispatch(setUserToken(user.token));
        dispatch(setIsLoggedIn(true));

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
      const result = await googleLogin(credentialResponse.credential).unwrap(); // .unwrap() для отримання результату мутації без обгортки.
      // console.log(" LoginPage >> google result:::", result);
      const user = { ...result };
      // console.log(" LoginPage >> google user:::", user);
      dispatch(setUserCredentials(user));
      // dispatch(setUserToken(user.token));
      dispatch(setIsLoggedIn(true));
    } catch (error) {
      Notify.failure(t("err_google_login"));
      console.log("Google Login Error:", error);
    }
  };

  return (
    <>
      {!isLoggedIn && (
        <div className={css.container}>
          {/* <div className={css.pageHeader}>
            <p className={css.pageHeader_title}>{t("enter")}</p>
          </div> */}

          <div className={css.pageMain}>
            <GoogleLogin
              onSuccess={handleGoogleLogin} // Отримуємо токен Google
              onError={() => {
                Notify.failure(t("err_google_login"));
                console.log("Google Login Failed");
              }}
            />

            <AuthForm isRegister={false} onSubmit={submitCredentials} />
            <div className={css.pageFooter}></div>
          </div>
        </div>
      )}
      {isLoggedIn && <div>{(t("user"), { user: user.name })}</div>}
    </>
  );
}
