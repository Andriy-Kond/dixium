import { useDispatch, useSelector } from "react-redux";

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

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  clearLocalState,
  showNotification,
} from "redux/game/localPersonalSlice.js";
import { useState } from "react";
import { Notify } from "notiflix";

import ThemeToggleRadioBtns from "common/components/ui/ThemeToggle";
import LangSwitcherRadioBtns from "common/components/ui/LangSwitcher";

import css from "./UserMenu.module.scss";
import EditingForm from "common/components/game/FormEdit/FormEdit.jsx";

export default function UserMenu({ closeMenu = () => {} }) {
  const [setNickname, { isLoading }] = useSetNicknameMutation();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [logoutUser] = useLogoutUserMutation();
  const userCredentials = useSelector(selectUserCredentials);
  const { gameId } = useParams();
  const [nicknameValue, setNicknameValue] = useState(userCredentials.name);
  // console.log(" UserMenu >>");

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
    dispatch(
      showNotification({
        message: t("nick_reset"),
        type: "success",
      }),
    );

    setNicknameValue(userCredentials.name);
  };

  const btnStyle = ["btnBarMenu"];
  const isDisableSetNicknameBtn =
    !nicknameValue ||
    nicknameValue.length < 3 ||
    nicknameValue === userCredentials.name;

  const isDisableResetNicknameBtn = nicknameValue === userCredentials.name;

  return (
    <>
      {/* Умова userCredentials.name необхідно, щоб span не блимав при завантаженні користувача */}
      {userCredentials.name && (
        <>
          <EditingForm
            isDisableSet={isDisableSetNicknameBtn}
            isDisableReset={isDisableResetNicknameBtn}
            handleClear={handleClearNickName}
            handleSet={handleSetNickname}
            val={nicknameValue}
            setVal={setNicknameValue}
            labelText={t("nick")}
            type={"text"}
          />

          <div>
            <p className={css.infoText}>{t("display_mode")}</p>
            <ThemeToggleRadioBtns />
          </div>
          <div>
            <p className={css.infoText}>{t("language")}</p>
            <LangSwitcherRadioBtns />
          </div>
          <button className={css.btn} onClick={handleLogout}>
            {t("logout")}
          </button>
        </>
      )}
    </>
  );
}
