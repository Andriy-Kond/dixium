import { useState } from "react";
import css from "./AuthForm.module.scss";
import Button from "../Button/index.js";
import { useTranslation } from "react-i18next";

const initialState = {
  name: "",
  email: "",
  password: "",
};

export default function AuthForm({ isRegister, onSubmit, isDisabled }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialState);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const btnText = isRegister ? t("register") : t("login");

  return (
    <form className={css.authForm} onSubmit={onSubmit}>
      {isRegister && (
        <label className={css.formLabel}>
          {t("name")}
          <input
            className={css.formInput}
            type="text"
            name="name"
            placeholder={t("enter_name")}
            value={formData.name}
            onChange={handleChange}
          />
        </label>
      )}

      <label className={css.formLabel}>
        {t("email")}
        <input
          className={css.formInput}
          type="text"
          name="email"
          placeholder={t("enter_email")}
          value={formData?.email}
          onChange={handleChange}
        />
      </label>

      <label className={css.formLabel}>
        {t("password")}
        <input
          className={css.formInput}
          type="password"
          name="password"
          placeholder={t("enter_password")}
          value={formData?.password}
          onChange={handleChange}
        />
      </label>

      <Button btnText={btnText} disabled={isDisabled} />
    </form>
  );
}
