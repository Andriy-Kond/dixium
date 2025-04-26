import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Notify } from "notiflix";
import { useResetPasswordMutation } from "redux/auth/authApi";
import { useParams, useNavigate } from "react-router-dom";
import css from "./ResetPasswordPage.module.scss";
import Button from "common/components/ui/Button";
import { BiHide, BiSolidHide } from "react-icons/bi";

//^ Сторінка для введення нового пароля
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { resetToken } = useParams(); // Отримуємо токен з URL
  const navigate = useNavigate();
  // const [password, setPassword] = useState("");

  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async e => {
    e.preventDefault();

    if (passwordValue.length < 3) {
      setError(t("password_too_short"));
      Notify.failure(t("password_too_short"));
      return;
    }

    if (passwordValue !== confirmPassword) {
      setError(t("passwords_do_not_match"));
      Notify.failure(t("passwords_do_not_match"));
      return;
    }

    try {
      await resetPassword({ resetToken, passwordValue }).unwrap();
      Notify.success(t("password_reset_success"));
      navigate("/login");
    } catch (err) {
      const message = err.data?.message || t("err_reset_password");
      setError(message);
      Notify.failure(message);
    }
  };

  const toggleShowPassword = e => {
    e.preventDefault();
    setShowPassword(prev => !prev);
  };

  return (
    <div className={css.container}>
      <div className={css.pageMain}>
        <h2>{t("set_new_password")}</h2>

        {error && <p className={css.error}>{error}</p>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <label className={css.formLabel}>
            {t("new_password")}
            <div className={css.inputContainer}>
              <input
                className={css.formInput}
                autoComplete="new-password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("enter_password")}
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value.trim())}
                required
              />

              <div
                className={css.showPasswordButton}
                onClick={toggleShowPassword}>
                {showPassword ? (
                  <BiHide className={css.hideIcon} />
                ) : (
                  <BiSolidHide className={css.hideIcon} />
                )}
              </div>
            </div>
          </label>

          <label className={css.formLabel}>
            {t("confirm_password")}
            <input
              autoComplete="new-password"
              className={css.formInput}
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder={t("confirm_password")}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value.trim())}
              required
            />
          </label>

          <div className={css.buttonContainer}>
            <Button btnText={t("reset_password")} disabled={isLoading} />
          </div>
        </form>
      </div>
    </div>
  );
}
