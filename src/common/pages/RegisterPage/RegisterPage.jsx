import { useDispatch } from "react-redux";
import { useSignupUserMutation } from "features/users/usersApi";
import {
  setIsLoggedIn,
  setUserCredentials,
  setUserToken,
} from "features/auth/authSlice";

import AuthForm from "common/components/AuthForm";
import css from "common/components/AuthForm/AuthForm.module.scss";
import { Notify } from "notiflix";

export default function RegisterPage() {
  const dispatch = useDispatch();
  const [signupUser] = useSignupUserMutation();

  const submitCredentials = async e => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const userCredentials = Object.fromEntries(formData);
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      const result = await signupUser(userCredentials);

      if (result.error) {
        Notify.failure(result.error.data.message);
      } else {
        const user = { ...result?.data };
        dispatch(setUserCredentials(user));
        dispatch(setUserToken(user.token));

        form.reset();

        // Here you can immediately come to private route:
        dispatch(setIsLoggedIn(true));
        // and/or navigate to needed page:
        // navigate("/somePrivatPage",  { replace: true });
        // Якщо вказати значення true, то новий лист підмінить собою найвищий. Це використовується досить рідко, наприклад при логіні, щоб користувач не зміг повернутися кнопкою «назад» на сторінку логіна після входу, адже він уже в системі і робити йому там нічого.

        // Or you can switch to login page after registration:
        // navigate("/login");
      }
    } catch (err) {
      dispatch(setIsLoggedIn(false));
      console.log("RegisterPage >> err:::", err);
    }
  };

  return (
    <div className={css.container}>
      <div className={css.pageHeader}>
        <p className={css.pageHeader_title}>Реєстрація</p>
      </div>

      <div className={css.pageMain}>
        <AuthForm isRegister={true} onSubmit={submitCredentials} />
      </div>

      <div className={css.pageFooter}></div>
    </div>
  );
}
