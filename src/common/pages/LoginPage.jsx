import { useDispatch, useSelector } from "react-redux";
import { selectUserToken } from "app/selectors";
import {
  useGetUserByTokenQuery,
  useLoginUserMutation,
} from "features/users/usersSlice";
import { setIsLoggedIn, setUserToken } from "features/auth/authSlice";

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
      <h2>Login Page</h2>

      {!isLoggedIn && !isFetching && (
        <form onSubmit={submitCredentials}>
          <input type="text" name="email" />
          <input type="text" name="password" />

          <button type="submit">Login</button>
        </form>
      )}

      {isLoggedIn && !isFetching && <div>User: {data?.name}</div>}
    </>
  );
}
