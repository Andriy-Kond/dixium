import { useDispatch, useSelector } from "react-redux";
import { selectUserToken } from "app/selectors";
import {
  useGetUserByTokenQuery,
  useLoginUserMutation,
} from "features/users/usersApi";
import { setIsLoggedIn, setUserToken } from "features/auth/authSlice";

import AuthForm from "common/components/AuthForm";
import css from "common/components/AuthForm/AuthForm.module.scss";

export default function LoginPage() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

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

    try {
      const result = await loginUser(userCredentials);

      dispatch(setUserToken(result?.data.token));
      dispatch(setIsLoggedIn(true));
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
          {/* <h2>Register Page</h2> */}
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
