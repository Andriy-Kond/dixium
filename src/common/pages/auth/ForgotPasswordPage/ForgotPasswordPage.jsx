import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Notify } from "notiflix";
import { useForgotPasswordMutation } from "redux/auth/authApi";
import css from "./ForgotPasswordPage.module.scss";
import Button from "common/components/ui/Button";
import FormEditInput from "common/components/ui/FormEditInput";

//^ Компонент для введення email, на який буде надіслано посилання для скидання паролю.
export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

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
      <h2>{t("reset_password")}</h2>
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
        <Button btnText={t("send_reset_link")} disabled={isLoading} />
      </form>
    </div>
  );
}
