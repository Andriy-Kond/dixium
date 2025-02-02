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
    <div className={css.container}>
      {/* <h2>Register Page</h2> */}
      <div className={css.pageHeader}>
        <p className={css.pageHeader_title}>Вхід</p>
      </div>

      <div className={css.pageMain}>
        <form className={css.registerForm} onSubmit={submitCredentials}>
          <label className={css.formLabel}>
            Name
            <input
              className={css.formInput}
              type="text"
              name="name"
              placeholder="Enter name"
            />
          </label>

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
              type="text"
              name="password"
              placeholder="Enter password"
            />
          </label>

          <button className={css.buttonPrimary} type="submit">
            REGISTER
          </button>
        </form>
      </div>

      <div className={css.pageFooter}></div>
    </div>
  );
}
