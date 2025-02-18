import clsx from "clsx";
import { selectUserCredentials, selectUserToken } from "app/selectors";
import {
  clearAuthInitialState,
  // setIsLoggedIn,
  // setUserToken,
} from "features/auth/authSlice";
import {
  // useGetUserByTokenQuery,
  useLogoutUserMutation,
  usersApi,
} from "features/users/usersApi";

import css from "./UserMenu.module.scss";
import avatar from "imgs/pending-cat.jpg";

import { useDispatch, useSelector } from "react-redux";
import Button from "common/components/Button";
import { clearGameInitialState } from "features/game/gameSlice.js";

export default function UserMenu() {
  const dispatch = useDispatch();
  const authUserToken = useSelector(selectUserToken);

  // const { data: userCredentials = [] } = useGetUserByTokenQuery(null, {
  //   skip: !authUserToken,
  //   refetchOnMountOrArgChange: false, // не робити новий запит при кожному монтуванні компонента, якщо дані вже є в кеші.
  // });

  const userCredentials = useSelector(selectUserCredentials);

  const [logoutUser] = useLogoutUserMutation();

  const handleLogout = async () => {
    await logoutUser();
    dispatch(clearGameInitialState());
    dispatch(clearAuthInitialState());
    // dispatch(setUserToken(null));
    // dispatch(setIsLoggedIn(false));
    // dispatch(usersApi.util.resetApiState()); // очистити стан Redux від старих даних (user, email)
  };

  const btnText = "Logout";
  // const btnStyle = "btnBarMenu";
  const btnStyle = ["btnBarMenu"];

  return (
    <>
      {/* Умова userCredentials.name необхідно, щоб span не блимав при завантаженні користувача */}
      {userCredentials.name && (
        <div className={css.userCredentialsBox}>
          <img
            className={css.avatar}
            src={userCredentials.avatarURL}
            alt="avatar"
          />
          <span className={css.text}>{`Welcome, ${userCredentials.name}`}</span>
          <Button
            onClick={handleLogout}
            btnText={btnText}
            btnStyle={btnStyle}
          />
        </div>
      )}
    </>
  );
}
