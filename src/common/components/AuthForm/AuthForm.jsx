import css from "./AuthForm.module.scss";

export default function AuthForm({ isRegister, onSubmit }) {
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
        />
      </label>

      <label className={css.formLabel}>
        Password
        <input
          className={css.formInput}
          type="password"
          name="password"
          placeholder="Enter password"
        />
      </label>

      <button className={css.buttonPrimary} type="submit">
        {isRegister ? "REGISTER" : "LOGIN"}
      </button>
    </form>
  );
}
