import { setUserToken } from "features/auth/authSlice";
import { useSignupUserMutation } from "features/users/usersSlice";
import { useDispatch } from "react-redux";

import AuthForm from "common/components/AuthForm";
import css from "common/components/AuthForm/AuthForm.module.scss";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [signupUser] = useSignupUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);

    const result = await signupUser(userCredentials);

    if (result.error) {
      if (result.error.data.message)
        console.log("result.error.message", result.error.data.message);
      return;
    }

    dispatch(setUserToken(result.data.token));
    form.reset();
    navigate("/login");
  };

  return (
    <div className={css.container}>
      <div className={css.pageHeader}>
        <p className={css.pageHeader_title}>Вхід</p>
      </div>

      <div className={css.pageMain}>
        <AuthForm isRegister={true} onSubmit={submitCredentials} />
      </div>

      <div className={css.pageFooter}></div>
    </div>
  );
}
