import { useDispatch, useSelector } from "react-redux";
import { MdCheck, MdClear } from "react-icons/md";

import {
  authApi,
  useLogoutUserMutation,
  useSetNicknameMutation,
} from "redux/auth/authApi";
import {
  clearAuthInitialState,
  setUserCredentials,
} from "redux/auth/authSlice";
import { clearGameInitialState } from "redux/game/gameSlice.js";
import { selectUserCredentials } from "redux/selectors";
import Button from "common/components/ui/Button";

import css from "./UserMenu.module.scss";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  clearLocalState,
  showNotification,
} from "redux/game/localPersonalSlice.js";
import { useState } from "react";
import { Notify } from "notiflix";
import InformMessage from "common/components/ui/InformMessage/InformMessage.jsx";
import LangSwitcher from "../LangSwitcher/index.js";
import ThemeToggle from "common/components/ui/ThemeToggle/index.js";

export default function UserMenu({ closeMenu }) {
  const [setNickname, { isLoading }] = useSetNicknameMutation();
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

  const handleSetNickname = async () => {
    if (!nicknameValue) {
      dispatch(
        showNotification({
          message: t("nick_cant_be_empty"),
          type: "error",
        }),
      );
      return;
    }

    if (nicknameValue.length < 3) {
      dispatch(
        showNotification({
          message: t("nick_should_have_3_symbols"),
          type: "error",
        }),
      );
      return;
    }

    try {
      const result = await setNickname({ nickname: nicknameValue }).unwrap();
      console.log(" handleSetNickname >> result:::", result);

      dispatch(
        showNotification({
          message: t("nick_changed"),
          type: "success",
        }),
      );

      dispatch(authApi.util.invalidateTags(["User"])); // update authApi
      dispatch(setUserCredentials({ ...userCredentials, name: result.name })); // update authSlice
    } catch (err) {
      Notify.failure(`${t("err")}: ${err.message}`);
      console.log("err: :>> ", err.message);
    }
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
          {/* <InformMessage /> */}
          {/* <div className={css.userCredentialsBox}> */}
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

          {t("display_mode")}
          <LangSwitcher />
          {t("language")}
          <ThemeToggle />

          <Button
            onClick={handleLogout}
            btnText={t("logout")}
            btnStyle={btnStyle}
          />
          {/* </div> */}
        </>
      )}
    </>
  );
}
