import { setUserToken } from "features/auth/authSlice";
import { useSignupUserMutation } from "features/users/usersSlice";
import { useDispatch } from "react-redux";

import {
  MainBg,
  MainBgHeader,
  ActionBar,
  RegisterForm,
  FormInput,
  FormField,
} from "./RegisterPage.styled";
import { FormLabel } from "@mui/material";
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
      <MainBg>
        <h2>Register Page</h2>
        <MainBgHeader>Вхід</MainBgHeader>
        <ActionBar>
          {/* <RegisterForm onSubmit={submitCredentials}>
            <FormField>
              <FormLabel htmlFor="name">Name</FormLabel>
              <FormInput
                id="name"
                type="text"
                name="name"
                placeholder="Enter name"
              />
            </FormField>
            <FormField>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormInput
                id="email"
                type="text"
                name="email"
                placeholder="Enter email"
              />
            </FormField>
            <FormField>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormInput
                id="password"
                type="text"
                name="password"
                placeholder="Enter password"
              />
            </FormField>
          </RegisterForm> */}

          <form className={css.RegisterForm} onSubmit={submitCredentials}>
            <label htmlFor="name" className={css.FormLabel}>
              Name
            </label>
            <input
              id="name"
              className={css.FormInput}
              type="text"
              name="name"
              placeholder="Enter name"
            />
            <label htmlFor="email" className={css.FormLabel}>
              Email
            </label>
            <input
              id="email"
              className={css.FormInput}
              type="text"
              name="email"
              placeholder="Enter email"
            />

            <label htmlFor="password" className={css.FormLabel}>
              Password
            </label>
            <input
              id="password"
              className={css.FormInput}
              type="text"
              name="password"
              placeholder="Enter password"
            />

            <button type="submit">Register</button>
          </form>
        </ActionBar>
      </MainBg>
    </>
  );
}
