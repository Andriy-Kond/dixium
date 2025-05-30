import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Notify } from "notiflix";
import { useForgotPasswordMutation } from "redux/auth/authApi";
import css from "./ForgotPasswordPage.module.scss";
import Button from "common/components/ui/Button";
import FormEditInput from "common/components/ui/FormEditInput";
import { useDispatch } from "react-redux";
import {
  setIsSetPassword,
  setPageHeaderText,
  setPageHeaderTextSecond,
} from "redux/game/localPersonalSlice.js";

//^ Компонент для введення email, на який буде надіслано посилання для скидання паролю.
export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(t("reset_password")));
    dispatch(setPageHeaderTextSecond(""));
    return () => dispatch(setIsSetPassword(false)); // Чи потрібно перенаправляти користувача на додаткове встановлення паролю після google-авторизації
  }, [dispatch, t]);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      Notify.success(t("reset_password_email_sent"));
      setEmail("");
    } catch (err) {
      Notify.failure(err.data?.message || t("err_reset_password"));
    }
  };

  return (
    <div className={css.container}>
      <form onSubmit={handleSubmit} className={css.form}>
        <label className={css.formLabel}>
          {t("email")}
          <FormEditInput
            type="email"
            name="email"
            placeholder={t("enter_email")}
            value={email}
            onChange={e => setEmail(e.target.value.trim())}
            required={true}
          />
        </label>
        <button className={css.btn} disabled={isLoading}>
          {t("send_reset_link")}
        </button>
      </form>
    </div>
  );
}
