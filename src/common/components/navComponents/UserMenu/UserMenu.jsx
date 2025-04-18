import { useDispatch, useSelector } from "react-redux";

import { useLogoutUserMutation } from "redux/auth/authApi";
import { clearAuthInitialState } from "redux/auth/authSlice";
import { clearGameInitialState } from "redux/game/gameSlice.js";

import Button from "common/components/ui/Button";

import css from "./UserMenu.module.scss";
import { useTranslation } from "react-i18next";
import { selectUserCredentials } from "redux/selectors/selectorsAuthSlice.js";

export default function UserMenu({ closeMenu }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [logoutUser] = useLogoutUserMutation();
  const userCredentials = useSelector(selectUserCredentials);

  const handleLogout = async () => {
    await logoutUser();
    dispatch(clearGameInitialState());
    dispatch(clearAuthInitialState());

    closeMenu();
  };

  const btnStyle = ["btnBarMenu"];

  return (
    <>
      {/* Умова userCredentials.name необхідно, щоб span не блимав при завантаженні користувача */}
      {userCredentials.name && (
        <>
          <div className={css.userCredentialsBox}>
            <img
              className={css.avatar}
              src={userCredentials.avatarURL}
              alt="avatar"
            />

            <span className={css.text}>
              {t("welcome_user", { user: userCredentials.name.toUpperCase() })}
            </span>

            <Button
              onClick={handleLogout}
              btnText={t("logout")}
              btnStyle={btnStyle}
            />
          </div>
        </>
      )}
    </>
  );
}
