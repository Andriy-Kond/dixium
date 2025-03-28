import { useDispatch, useSelector } from "react-redux";

import { useLogoutUserMutation } from "redux/auth/authApi";
import { clearAuthInitialState } from "redux/auth/authSlice";
import { clearGameInitialState } from "redux/game/gameSlice.js";
import { selectUserCredentials } from "redux/selectors";
import Button from "common/components/ui/Button";

import css from "./UserMenu.module.scss";

export default function UserMenu() {
  const dispatch = useDispatch();
  const [logoutUser] = useLogoutUserMutation();
  const userCredentials = useSelector(selectUserCredentials);

  const handleLogout = async () => {
    await logoutUser();
    dispatch(clearGameInitialState());
    dispatch(clearAuthInitialState());
  };

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
          <span
            className={
              css.text
            }>{`Welcome, ${userCredentials.name.toUpperCase()}`}</span>
          <Button
            onClick={handleLogout}
            btnText={"Logout"}
            btnStyle={btnStyle}
          />
        </div>
      )}
    </>
  );
}
