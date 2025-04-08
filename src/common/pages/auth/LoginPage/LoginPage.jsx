import { useDispatch, useSelector } from "react-redux";

import { useLoginUserMutation } from "redux/auth/authApi";
import {
  setIsLoggedIn,
  setUserCredentials,
  setUserToken,
} from "redux/auth/authSlice";
import { selectUserCredentials, selectUserIsLoggedIn } from "redux/selectors";
import AuthForm from "common/components/ui/AuthForm";
import css from "common/components/ui/AuthForm/AuthForm.module.scss";
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

  useEffect(() => {
    dispatch(setPageHeaderText(t("enter")));
  }, [dispatch, t]);

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      const result = await loginUser(userCredentials);

      if (result.error) {
        Notify.failure(result.error.data.message);
      } else {
        const user = { ...result?.data };
        dispatch(setUserCredentials(user));
        dispatch(setUserToken(user.token));
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

  return (
    <>
      {!isLoggedIn && (
        <div className={css.container}>
          {/* <div className={css.pageHeader}>
            <p className={css.pageHeader_title}>{t("enter")}</p>
          </div> */}

          <div className={css.pageMain}>
            <AuthForm isRegister={false} onSubmit={submitCredentials} />
            <div className={css.pageFooter}></div>
          </div>
        </div>
      )}
      {isLoggedIn && <div>{(t("user"), { user: user.name })}</div>}
    </>
  );
}
