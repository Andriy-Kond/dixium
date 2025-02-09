import { useState } from "react";
import css from "./AuthForm.module.scss";

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

      <button className={css.buttonPrimary} type="submit">
        {isRegister ? "REGISTER" : "LOGIN"}
      </button>
    </form>
  );
}
