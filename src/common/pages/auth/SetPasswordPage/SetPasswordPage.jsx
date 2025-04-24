// Обробка нових повідомлень про помилки:
//     "Цей обліковий запис зареєстровано через Google. Будь ласка, використовуйте вхід через Google або встановіть пароль." (з login).
//     "Цей email зареєстровано через Google. Увійдіть через Google і встановіть пароль, щоб активувати вхід через email/пароль." (з register).
//     "Забагато запитів, спробуйте ще раз пізніше." (з обмежувача).

// Потік встановлення пароля:
//     Після отримання помилки для Google-облікового запису, запропонувати користувачу увійти через Google і перейти до сторінки /set-password.

// Користувацький досвід:
//     Показувати чіткі інструкції (наприклад, кнопки для входу через Google або встановлення пароля).
//     Уникати різких повідомлень про помилки, скеровуючи користувача.

import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Notify } from "notiflix";
import {
  setIsSetPassword,
  setPageHeaderText,
} from "redux/game/localPersonalSlice.js";
import { useSetPasswordMutation } from "redux/auth/authApi.js";
import Button from "common/components/ui/Button";
import css from "./SetPasswordPage.scss";

export default function SetPasswordPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [setPassword, { isLoading }] = useSetPasswordMutation();
  const [passwordValue, setPasswordValue] = useState("");
  const [error, setError] = useState(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(setPageHeaderText(t("set_password")));
    return () => {
      // Очистити прапор при демонтажі компонента, якщо пароль не встановлено
      if (!passwordValue) dispatch(setIsSetPassword(false));
    };
  }, [dispatch, t, passwordValue]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (passwordValue !== confirmPassword) {
      setError(t("passwords_do_not_match"));
      Notify.failure(t("passwords_do_not_match"));
      return;
    }

    try {
      // const result = await setPassword({ password: passwordValue }).unwrap();
      // if (result.message.includes("Setup password success!")) {
      //   Notify.success(t("password_set_success"));
      //   navigate("/game"); // Перенаправлення до приватного маршруту
      // } else throw new Error("Cannot to set password");
      await setPassword({ password: passwordValue }).unwrap(); // .unwrap() - якщо буде помилка (статус не 200), то воно викине помилку з даними у err.data (наприклад, { message: "Password is required!" })

      Notify.success(t("password_set_success"));
      dispatch(setIsSetPassword(false)); // Очистити прапор після успіху
      navigate("/game"); // Перенаправлення до приватного маршруту
    } catch (err) {
      const message = err.data?.message || t("err_no_access");
      setError(message);
      Notify.failure(message);
    }
  };

  const handleCancel = () => {
    dispatch(setIsSetPassword(false)); // Очистити прапор
    navigate("/game"); // Повернутися до гри
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div className={css.container}>
      <div className={css.pageMain}>
        <h2>{t("set_password")}</h2>

        {error && <p className={css.error}>{error}</p>}

        <form onSubmit={handleSubmit} autocomplete="off">
          <label className={css.formLabel}>
            {t("password")}
            <div className={css.inputContainer}>
              <input
                autocomplete="new-password"
                className={css.formInput}
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("enter_password")}
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value.trim())}
              />

              <button
                type="button"
                className={css.showPasswordButton}
                onClick={toggleShowPassword}>
                {showPassword ? t("hide_password") : t("show_password")}
              </button>
            </div>
          </label>

          <label className={css.formLabel}>
            {t("confirm_password")}
            <input
              autocomplete="new-password"
              className={css.formInput}
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("confirm_password")}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value.trim())}
            />
          </label>

          <div className={css.buttonContainer}>
            <Button btnText={t("submit")} disabled={isLoading} />

            <Button
              btnText={t("cancel")}
              onClick={handleCancel}
              className={css.cancelButton}
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
