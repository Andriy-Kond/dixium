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
  const [showV2Captcha, setShowV2Captcha] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const recaptchaV2Ref = useRef(null);
  const resetTimeout = useRef(null); // Для збереження таймера

  useEffect(() => {
    dispatch(setPageHeaderText(t("verify_email")));
  }, [dispatch, t]);

  useEffect(() => {
    console.log("showV2Captcha changed to:", showV2Captcha);
  }, [showV2Captcha]);

  useEffect(() => {
    const handleUnhandledRejection = event => {
      console.error("Unhandled promise rejection:", event.reason);
      event.preventDefault();
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  const resetCaptcha = () => {
    // Очищаємо попередній таймер, якщо він існує
    if (resetTimeout.current) {
      clearTimeout(resetTimeout.current);
    }

    // Встановлюємо новий таймер для відкладеного reset
    resetTimeout.current = setTimeout(() => {
      if (recaptchaV2Ref.current) {
        try {
          recaptchaV2Ref.current.reset();
          console.log("reCAPTCHA v2 reset successfully");
        } catch (err) {
          console.error("Error resetting reCAPTCHA v2:", err);
        }
      }
    }, 1000); // Затримка 1 секунда
  };

  const handleResendEmail = async (token_v2 = null) => {
    console.log("handleResendEmail called with token_v2:", token_v2);
    if (!email || !EMAIL_TEMPLATE.test(email)) {
      setError(t("invalid_email"));
      Notify.failure(t("invalid_email"));
      return;
    }

    if (!navigator.onLine) {
      console.error("No internet connection");
      setError(t("no_internet"));
      Notify.failure(t("no_internet"));
      return;
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Operation timeout")), 15000);
    });

    try {
      if (!token_v2) {
        console.log("Чекаю, поки користувач пройде капчу V2");
        return;
      }

      console.log(
        "Відправлення запиту із email, recaptchaToken і типом CAPTCHA",
      );
      const response = await Promise.race([
        resendVerificationEmail({
          email,
          recaptchaToken: token_v2,
          captchaType: "v2",
        }).unwrap(),
        timeoutPromise,
      ]);
      console.log("Server response:", response);

      Notify.success(t("verification_email_sent"));
      setError(null);
      setShowV2Captcha(false);
      setRecaptchaToken(null);
      navigate("/login");
    } catch (err) {
      console.error("Виникла помилка >> err:", err);
      const message = err?.data?.message || t("err_no_access");
      setError(message);
      Notify.failure(message);
    } finally {
      // Викликаємо відкладений reset
      resetCaptcha();
    }
  };

  const handleV2CaptchaChange = async token_v2 => {
    console.log("reCAPTCHA v2 token received:", token_v2);
    setRecaptchaToken(token_v2);
    if (token_v2) {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("reCAPTCHA v2 timeout")), 10000);
      });
      try {
        await Promise.race([handleResendEmail(token_v2), timeoutPromise]);
      } catch (err) {
        console.error("Error in handleResendEmail:", err);
        setError(t("recaptcha_failed"));
        Notify.failure(t("recaptcha_failed"));
      }
    } else {
      console.error("reCAPTCHA v2 failed or expired");
      setError(t("please_complete_recaptcha"));
      Notify.failure(t("please_complete_recaptcha"));
    }
  };

  // Очищення таймера при демонтажі компонента
  useEffect(() => {
    return () => {
      if (resetTimeout.current) {
        clearTimeout(resetTimeout.current);
      }
    };
  }, []);

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

        {showV2Captcha && (
          <ReCAPTCHA
            ref={recaptchaV2Ref}
            sitekey={process.env.REACT_APP_GOOGLE_CAPTCHA_V2_DIXIUM}
            size="normal"
            onChange={handleV2CaptchaChange}
          />
        )}

        <Button
          btnText={t("resend_verification_email")}
          onClick={() => handleResendEmail()}
          disabled={isLoading || (showV2Captcha && !recaptchaToken)}
          loading={isLoading}
        />
      </div>
    </div>
  );
}
