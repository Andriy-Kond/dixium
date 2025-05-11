import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Notify } from "notiflix";
import { useTranslation } from "react-i18next";

import { setPageHeaderText } from "redux/game/localPersonalSlice.js";
import { useResendVerificationEmailMutation } from "redux/auth/authApi.js";
import Button from "common/components/ui/Button";

import { EMAIL_TEMPLATE } from "utils/generals/constants.js";
import css from "./VerifyEmailPage.module.scss";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [resendVerificationEmail, { isLoading }] =
    useResendVerificationEmailMutation();

  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [showV2Captcha, setShowV2Captcha] = useState(true); // Стан для reCAPTCHA v2
  const [recaptchaToken, setRecaptchaToken] = useState(null); // Зберігаємо токен для v2

  const recaptchaV3Ref = useRef(null);
  const recaptchaV2Ref = useRef(null);

  useEffect(() => {
    dispatch(setPageHeaderText(t("verify_email")));
  }, [dispatch, t]);

  const handleResendEmail = async token_v2 => {
    // console.log(" handleResendEmail >> token_v2:::", token_v2);
    if (!email || !EMAIL_TEMPLATE.test(email)) {
      setError(t("invalid_email"));
      Notify.failure(t("invalid_email"));
      return;
    }

    // Якщо reCAPTCHA v3 не пройшла (score < 0.5), клієнт показує reCAPTCHA v2 (чекбокс).
    // reCAPTCHA v2 перевіряється лише за success, оскільки вона вже є інтерактивною.
    try {
      let token_v3 = null;

      // Виконуємо reCAPTCHA для отримання токена
      if (!showV2Captcha) {
        console.log("showV2Captcha false, використовую V3");

        // Використовуємо reCAPTCHA v3
        token_v3 = await recaptchaV3Ref.current.executeAsync();
        // executeAsync() викликає reCAPTCHA у фоновому режимі та повертає токен (працює лише для невидимих версій captcha).

        console.log(">> token of V3:::", token_v3);

        // Обробка помилки, якщо є використання reCAPTCHA v3, але токен не валідний
        if (!token_v3) {
          console.log("Токен v3 не отримано", token_v3);
          setError(t("recaptcha_failed"));
          Notify.failure(t("recaptcha_failed"));
          return;
        }
      } else if (!token_v2) {
        // Якщо v2 активна, але токен ще не отриманий, чекаємо onChange
        console.log("Чекаю, поки користувач пройде капчу V2");
        return; // Просто чекай, не викликай Notify
      }

      // Відправляємо запит із email, recaptchaToken і типом CAPTCHA
      console.log(
        "Відправлення запиту із email, recaptchaToken і типом CAPTCHA",
      );

      await resendVerificationEmail({
        email,
        recaptchaToken: showV2Captcha ? token_v2 : token_v3,
        captchaType: showV2Captcha ? "v2" : "v3",
      }).unwrap();

      Notify.success(t("verification_email_sent"));
      setError(null);
      setShowV2Captcha(false);
      setRecaptchaToken(null);
      navigate("/login");
    } catch (err) {
      console.log(" Виникла якась помилка >> err:::", err);
      const message = err?.data?.message || t("err_no_access");

      if (
        message.includes("reCAPTCHA V3 verification failed") &&
        !showV2Captcha
      ) {
        console.log(
          "reCAPTCHA V3 verification failed і поки що showV2Captcha - false ",
        );
        console.log("встановлюю showV2Captcha у true");
        setShowV2Captcha(true); // Перемикаємо на v2, якщо v3 не вдалася
      } else {
        setError(message);
        Notify.failure(message);
      }
    } finally {
      // Скидаємо обидві CAPTCHA після виконання
      if (recaptchaV3Ref.current) {
        console.log("Resetting reCAPTCHA v3");
        recaptchaV3Ref.current.reset();
      }
      if (recaptchaV2Ref.current) {
        console.log("Resetting reCAPTCHA v2");
        recaptchaV2Ref.current.reset();
      }
    }
  };

  // Обробка токена від reCAPTCHA v2
  const handleV2CaptchaChange = token_v2 => {
    setRecaptchaToken(token_v2);
    if (token_v2) {
      handleResendEmail(token_v2);
    } else {
      console.error("reCAPTCHA v2 failed or expired");
      setError(t("please_complete_recaptcha"));
      Notify.failure(t("please_complete_recaptcha"));
    }
  };

  return (
    <div className={css.container}>
      <div className={css.pageMain}>
        <h2>{t("verify_email")}</h2>
        <p>{t("verify_email_message")}</p>

        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t("enter_email")}
          className={css.input}
        />

        {error && <p className={css.error}>{error}</p>}

        {/* reCAPTCHA v3 (невидимий) */}
        <ReCAPTCHA
          ref={recaptchaV3Ref}
          sitekey={process.env.REACT_APP_GOOGLE_CAPTCHA_V3_DIXIUM}
          size="invisible"
        />

        {/* reCAPTCHA v2 (видимий, з чекбоксом) */}
        {showV2Captcha && (
          <ReCAPTCHA
            ref={recaptchaV2Ref}
            sitekey={process.env.REACT_APP_GOOGLE_CAPTCHA_V2_DIXIUM}
            size="normal" // Видимий чекбокс
            onChange={handleV2CaptchaChange}
          />
        )}

        <Button
          btnText={t("resend_verification_email")}
          onClick={handleResendEmail}
          disabled={isLoading || (showV2Captcha && !recaptchaToken)}
          loading={isLoading} // Додайте пропс для спінера, якщо ваш Button підтримує
        />
      </div>
    </div>
  );
}
