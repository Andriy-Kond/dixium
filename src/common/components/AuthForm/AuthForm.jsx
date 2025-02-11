import { useState } from "react";
import css from "./AuthForm.module.scss";
import Button from "../Button/index.js";

const initialState = {
  name: "",
  email: "",
  password: "",
};

export default function AuthForm({ isRegister, onSubmit }) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const btnText = isRegister ? "Register" : "Login";
  console.log("AuthForm >> isRegister:::", isRegister);
  return (
    <form className={css.authForm} onSubmit={onSubmit}>
      {isRegister && (
        <label className={css.formLabel}>
          Name
          <input
            className={css.formInput}
            type="text"
            name="name"
            placeholder="Enter name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
      )}

      <label className={css.formLabel}>
        Email
        <input
          className={css.formInput}
          type="text"
          name="email"
          placeholder="Enter email"
          value={formData?.email.toLowerCase()}
          onChange={handleChange}
        />
      </label>

      <label className={css.formLabel}>
        Password
        <input
          className={css.formInput}
          type="password"
          name="password"
          placeholder="Enter password"
          value={formData?.password}
          onChange={handleChange}
        />
      </label>

      <Button btnText={btnText} />
    </form>
  );
}
