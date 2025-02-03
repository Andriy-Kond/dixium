import { selectUserToken } from "app/selectors";
import { setIsLoggedIn, setUserToken } from "features/auth/authSlice";
import {
  useGetUserByTokenQuery,
  useLogoutUserMutation,
  usersApi,
} from "features/users/usersSlice";

import css from "./UserMenu.module.scss";
import avatar from "imgs/pending-cat.jpg";

import { useDispatch, useSelector } from "react-redux";

export default function UserMenu() {
  const dispatch = useDispatch();
  const authUserToken = useSelector(selectUserToken);
  const { data: userCredentials = [] } = useGetUserByTokenQuery(null, {
    skip: !authUserToken,
  });
  const [logoutUser] = useLogoutUserMutation();

  const handleLogout = async () => {
    await logoutUser();
    dispatch(setUserToken(null));
    dispatch(setIsLoggedIn(false));
    dispatch(usersApi.util.resetApiState()); // очистити стан Redux від старих даних (user, email)
  };

  return (
    <>
      {/* Умова userCredentials.name необхідно, щоб span не блимав при завантаженні користувача */}
      {userCredentials.name && (
        <div className={css.userCredentialsBox}>
          <img className={css.avatar} src={avatar} alt="avatar" />
          <span className={css.text}>Welcome, {userCredentials.name}</span>
          <button
            type="button"
            className={css.buttonBarMenu}
            onClick={handleLogout}>
            LOGOUT
          </button>
        </div>
      )}
    </>
  );
}
