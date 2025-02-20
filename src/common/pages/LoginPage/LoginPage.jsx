import { Notify } from "notiflix/build/notiflix-notify-aio";
import { useDispatch, useSelector } from "react-redux";

import { useLoginUserMutation } from "features/users/usersApi";
import {
  setIsLoggedIn,
  setUserCredentials,
  setUserToken,
} from "features/auth/authSlice";
import { selectUserCredentials, selectUserIsLoggedIn } from "app/selectors";
import AuthForm from "common/components/AuthForm";
import css from "common/components/AuthForm/AuthForm.module.scss";

export default function LoginPage() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectUserIsLoggedIn);
  const user = useSelector(selectUserCredentials);
  const [loginUser] = useLoginUserMutation();

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
        const user = { ...result?.data, userId: result?.data._id };
        dispatch(setUserCredentials(user));
        dispatch(setUserToken(user.token));
        dispatch(setIsLoggedIn(true));

        // Here you can navigate to needed page, if you have it:
        // navigate("/somePrivatPage",  { replace: true });

        // refetch(); // Змушує RTK Query, а саме - getUserByToken зі стану RTK Query робити повторний запит до серверу після логіна
      }
    } catch (err) {
      dispatch(setIsLoggedIn(false));
      console.log("submitCredentials >> err:::", err);
    }
  };

  return (
    <>
      {!isLoggedIn && (
        <div className={css.container}>
          <div className={css.pageHeader}>
            <p className={css.pageHeader_title}>Вхід</p>
          </div>

          <div className={css.pageMain}>
            <AuthForm isRegister={false} onSubmit={submitCredentials} />
          </div>

          <div className={css.pageFooter}></div>
        </div>
      )}
      {isLoggedIn && <div>User: {user.name}</div>}
    </>
  );
}
