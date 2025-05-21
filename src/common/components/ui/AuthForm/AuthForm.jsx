import { useState } from "react";
import Button from "../Button/index.js";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import FormInput from "../FormEditInput/FormEditInput.jsx";

import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import css from "./AuthForm.module.scss";

const initialState = {
  name: "",
  email: "",
  password: "",
};

export default function AuthForm({ isRegister, onSubmit, isDisabled }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };
  const toggleShowPassword = e => {
    e.preventDefault(); // скасовує відкриття списку паролів з кешу браузера
    setShowPassword(prev => !prev);
  };

  const btnText = isRegister ? t("register") : t("login");

  return (
    <>
      <form className={css.authForm} onSubmit={onSubmit}>
        {isRegister && (
          <label className={css.formLabel}>
            {t("name")}
            <FormInput
              name={"name"}
              placeholder={t("enter_name")}
              val={formData.name}
              onChange={handleChange}
            />
          </label>
        )}

        <label className={css.formLabel}>
          {t("email")}

          <FormInput
            name={"email"}
            placeholder={t("enter_email")}
            val={formData?.email}
            onChange={handleChange}
          />
        </label>

        <label className={css.formLabel}>
          {t("password")}

          <div className={css.inputContainer}>
            <FormInput
              type={showPassword ? "text" : "password"}
              name={"password"}
              placeholder={t("enter_password")}
              val={formData?.password}
              onChange={handleChange}
            />

            <div
              className={css.showPasswordButton}
              onClick={toggleShowPassword}>
              {showPassword ? (
                <MdVisibility className={css.hideIcon} />
              ) : (
                <MdVisibilityOff className={css.hideIcon} />
              )}
            </div>
          </div>
        </label>

        {!isRegister && (
          <Link to="/forgot-password" className={css.forgotPasswordLink}>
            {t("forgot_password")}
          </Link>
        )}

        <button className={css.btn} disabled={isDisabled}>
          {btnText}
        </button>
      </form>
    </>
  );
}
