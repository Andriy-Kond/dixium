import {
  setIsLoggedIn,
  setUserCredentials,
  setUserToken,
} from "features/auth/authSlice";
import { useSignupUserMutation } from "features/users/usersApi";
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
    userCredentials.email = userCredentials.email.toLowerCase();

    try {
      const result = await signupUser(userCredentials);
      console.log("RegisterPage >> result:::", result);

      dispatch(setUserCredentials(result?.data));
      dispatch(setUserToken(result?.data.token));
      // refetch(); // Змушує RTK Query, а саме - getUserByToken зі стану RTK Query робити повторний запит до серверу після логіна

      form.reset();

      // Here you can immediately come to private route:
      dispatch(setIsLoggedIn(true));
      // and navigate to needed page:
      // navigate("/somePrivatPage",  { replace: true });
      // Якщо вказати значення true, то новий лист підмінить собою найвищий. Це використовується досить рідко, наприклад при логіні, щоб користувач не зміг повернутися кнопкою «назад» на сторінку логіна після входу, адже він уже в системі і робити йому там нічого.

      // Or you can switch to login page after registration:
      // navigate("/login");
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
