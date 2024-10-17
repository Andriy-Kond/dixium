import { setUserToken } from "features/auth/authSlice";
import { useSignupUserMutation } from "features/users/usersSlice";
import { useDispatch } from "react-redux";

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
      <h2>Register Page</h2>
      <form onSubmit={submitCredentials}>
        <input type="text" name="name" />
        <input type="text" name="email" />
        <input type="text" name="password" />

        <button type="submit">Register</button>
      </form>
    </>
  );
}
