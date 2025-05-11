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
  const [showV2Captcha, setShowV2Captcha] = useState(false); // Стан для reCAPTCHA v2

  const recaptchaV3Ref = useRef(null);
  const recaptchaV2Ref = useRef(null);

  useEffect(() => {
    dispatch(setPageHeaderText(t("verify_email")));
  }, [dispatch, t]);

  const handleResendEmail = async () => {
    if (!email || !EMAIL_TEMPLATE.test(email)) {
      setError(t("invalid_email"));
      Notify.failure(t("invalid_email"));
      return;
    }

    // Якщо reCAPTCHA v3 не пройшла (score < 0.5), клієнт показує reCAPTCHA v2 (чекбокс).
    // reCAPTCHA v2 перевіряється лише за success, оскільки вона вже є інтерактивною.
    try {
      let recaptchaToken;
      // Виконуємо reCAPTCHA для отримання токена
      // executeAsync() викликає reCAPTCHA у фоновому режимі та повертає токен.
      if (showV2Captcha) {
        // Використовуємо reCAPTCHA v2
        recaptchaToken = await recaptchaV2Ref.current.executeAsync();
      } else {
        // Використовуємо reCAPTCHA v3
        recaptchaToken = await recaptchaV3Ref.current.executeAsync();
      }

      if (!recaptchaToken) {
        setError(t("recaptcha_failed"));
        Notify.failure(t("recaptcha_failed"));
        return;
      }

      // Відправляємо запит із email, recaptchaToken і типом CAPTCHA
      await resendVerificationEmail({
        email,
        recaptchaToken,
        captchaType: showV2Captcha ? "v2" : "v3",
      }).unwrap();

      Notify.success(t("verification_email_sent"));
      setError(null);
      navigate("/login");
    } catch (err) {
      console.log(" handleResendEmail >> err:::", err);

      const message = err.data?.message || t("err_no_access");

      // if (message.includes("reCAPTCHA verification failed")) {
      //   setError(t("recaptcha_failed_try_v2"));
      //   Notify.failure(t("recaptcha_failed_try_v2"));
      //   setShowV2Captcha(true); // Показуємо reCAPTCHA v2, якщо v3 не вдалася
      // }

      if (message.includes("reCAPTCHA verification failed")) {
        setShowV2Captcha(true); // Показуємо reCAPTCHA v2, якщо v3 не вдалася
      }

      setError(message);
      Notify.failure(message);
    } finally {
      // Скидаємо обидві CAPTCHA після виконання
      recaptchaV3Ref.current?.reset();
      recaptchaV2Ref.current?.reset();
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
            sitekey={process.env.REACT_APP_GOOGLE_CAPTCHA_V2_INVISIBLE_DIXIUM}
            size="normal" // Видимий чекбокс
          />
        )}

        <Button
          btnText={t("resend_verification_email")}
          onClick={handleResendEmail}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
