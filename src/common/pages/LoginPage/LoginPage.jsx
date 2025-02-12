import { useDispatch, useSelector } from "react-redux";
import { selectUserIsLoggedIn, selectUserToken } from "app/selectors";
import {
  useGetUserByTokenQuery,
  useLoginUserMutation,
} from "features/users/usersApi";
import {
  setIsLoggedIn,
  setUserCredentials,
  setUserToken,
} from "features/auth/authSlice";

import AuthForm from "common/components/AuthForm";
import css from "common/components/AuthForm/AuthForm.module.scss";

export default function LoginPage() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(selectUserIsLoggedIn);
  const authUserToken = useSelector(selectUserToken);

  const [loginUser] = useLoginUserMutation();

  const { data, isFetching, refetch } = useGetUserByTokenQuery(undefined, {
    skip: !authUserToken,
  });

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      const result = await loginUser(userCredentials);
      console.log("LoginPage >> result:::", result);

      dispatch(setUserCredentials(result?.data));
      dispatch(setUserToken(result?.data.token));
      dispatch(setIsLoggedIn(true));
      // Here you can navigate to needed page, if you have it:
      // navigate("/somePrivatPage",  { replace: true });
      // Якщо вказати значення true, то новий лист підмінить собою найвищий. Це використовується досить рідко, наприклад при логіні, щоб користувач не зміг повернутися кнопкою «назад» на сторінку логіна після входу, адже він уже в системі і робити йому там нічого.

      // refetch(); // Змушує RTK Query, а саме - getUserByToken зі стану RTK Query робити повторний запит до серверу після логіна
    } catch (err) {
      dispatch(setIsLoggedIn(false));
      console.log("submitCredentials >> err:::", err);
    }
  };

  return (
    <>
      {!isLoggedIn && !isFetching && (
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

      {isLoggedIn && !isFetching && <div>User: {data?.name}</div>}
    </>
  );
}
