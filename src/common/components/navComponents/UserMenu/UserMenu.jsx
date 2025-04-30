import { useDispatch, useSelector } from "react-redux";
import { MdCheck, MdClear } from "react-icons/md";

import {
  useLogoutUserMutation,
  useSetNicknameMutation,
} from "redux/auth/authApi";
import { clearAuthInitialState } from "redux/auth/authSlice";
import { clearGameInitialState } from "redux/game/gameSlice.js";
import { selectUserCredentials } from "redux/selectors";
import Button from "common/components/ui/Button";

import css from "./UserMenu.module.scss";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { clearLocalState } from "redux/game/localPersonalSlice.js";
import { useState } from "react";
import { Notify } from "notiflix";

export default function UserMenu({ closeMenu }) {
  const [setNickname] = useSetNicknameMutation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [logoutUser] = useLogoutUserMutation();
  const userCredentials = useSelector(selectUserCredentials);
  const { gameId } = useParams();
  const [nicknameValue, setNicknameValue] = useState(userCredentials.name);

  const handleLogout = async () => {
    await logoutUser();
    dispatch(clearGameInitialState());
    dispatch(clearAuthInitialState());
    dispatch(clearLocalState(gameId));

    closeMenu();
  };
  const handleSetNickname = () => {
    if (!nicknameValue) {
      return Notify;
    }

    setNickname(nicknameValue);
  };

  const handleClearNickName = () => {
    setNicknameValue(userCredentials.name);
  };
  const btnStyle = ["btnBarMenu"];

  return (
    <>
      {/* Умова userCredentials.name необхідно, щоб span не блимав при завантаженні користувача */}
      {userCredentials.name && (
        <>
          <div className={css.userCredentialsBox}>
            {/* <img
              className={css.avatar}
              src={userCredentials.avatarURL}
              alt="avatar"
            /> */}

            {/* <span className={css.text}>
              {t("welcome_user", { user: userCredentials.name.toUpperCase() })}
            </span> */}
            <label>
              {t("Нік")}
              <input
                type="text"
                value={nicknameValue}
                onChange={e => setNicknameValue(e.target.value.trim())}
              />
              <MdCheck onClick={handleSetNickname} />
              <MdClear onClick={handleClearNickName} />
            </label>

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
