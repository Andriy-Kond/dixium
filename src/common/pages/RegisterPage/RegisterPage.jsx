import { setUserToken } from "features/auth/authSlice";
import { useSignupUserMutation } from "features/users/usersSlice";
import { useDispatch } from "react-redux";

import css from "./RegisterPage.module.scss";

export default function RegisterPage() {
  const [signupUser] = useSignupUserMutation();
  const dispatch = useDispatch();

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);

    const result = await signupUser(userCredentials);

    if (result.error) {
      if (result.error.data.message) {
        console.log("result.error.message", result.error.data.message);
      }

      if (result.error.data?.keyValue?.email) {
        console.log(
          `submitCredentials >> error problem::: email ${result.error.data.keyValue.email}already exist in this DB`,
        );
      }
    } else {
      dispatch(setUserToken(result.data.token));
    }
  };

  return (
    <>
      <div className={css.mainBg}>
        <h2>Register Page</h2>
        <p className={css.mainBgHeader}>Вхід</p>
        <div className={css.actionBar}>
          <form className={css.registerForm} onSubmit={submitCredentials}>
            <label htmlFor="name" className={css.formLabel}>
              Name
            </label>
            <input
              id="name"
              className={css.formInput}
              type="text"
              name="name"
              placeholder="Enter name"
            />
            <label htmlFor="email" className={css.formLabel}>
              Email
            </label>
            <input
              id="email"
              className={css.formInput}
              type="text"
              name="email"
              placeholder="Enter email"
            />

            <label htmlFor="password" className={css.formLabel}>
              Password
            </label>
            <input
              id="password"
              className={css.formInput}
              type="text"
              name="password"
              placeholder="Enter password"
            />

            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </>
  );
}
