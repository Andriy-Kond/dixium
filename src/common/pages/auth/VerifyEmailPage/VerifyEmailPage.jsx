import { useDispatch, useSelector } from "react-redux";
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
import { selectInternetStatus } from "redux/selectors.js";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [resendVerificationEmail, { isLoading }] =
    useResendVerificationEmailMutation();
  const isOnline = useSelector(selectInternetStatus);

  const [email, setEmail] = useState("");
  const [showV2Captcha, setShowV2Captcha] = useState(false);
  const [recaptchaToken_v2, setRecaptchaToken_v2] = useState(null);

  const recaptchaV3Ref = useRef(null);
  const recaptchaV2Ref = useRef(null);
  const resetTimeout_v2 = useRef(null); // Для збереження таймера (для запобігання незавершених promise у react-google-recaptcha при використанні капчі v2)
  const resetTimeout_v3 = useRef(null);

  //# Page header color and text
  useEffect(() => {
    dispatch(setPageHeaderText(t("verify_email")));
  }, [dispatch, t]);

  const resetCaptcha = captchaType => {
    if (captchaType === "v2" && recaptchaV2Ref.current) {
      // console.log("Очищаю попередній таймер v2, якщо він існує");
      if (resetTimeout_v2.current) clearTimeout(resetTimeout_v2.current);

      // console.log("Встановлюю новий таймер v2 для відкладеного reset на 1сек");
      resetTimeout_v2.current = setTimeout(() => {
        try {
          // reset() у react-google-recaptcha:
          // Очищає стан віджета reCAPTCHA: Видаляє поточний токен і повертає віджет у початковий стан, готовний для повторного використання.
          // Оновлює <iframe>: Скидає внутрішній стан Google reCAPTCHA API, що може включати оновлення <iframe> або відправлення мережевих запитів до Google.
          // Запобігає повторному використанню токена: Гарантує, що старий токен не буде використано повторно, що важливо для безпеки.
          recaptchaV2Ref.current.reset();
          console.log("reCAPTCHA v2 reset successfully");
        } catch (err) {
          console.log("Error resetting reCAPTCHA v2:", err);
        }
      }, 1000); // Затримка 1 секунда
    }

    if (captchaType === "v3" && recaptchaV3Ref.current) {
      // console.log("Очищаю попередній таймер v3, якщо він існує");
      if (resetTimeout_v3.current) clearTimeout(resetTimeout_v3.current);
      // console.log("Встановлюю новий таймер v3 для відкладеного reset на 1сек");
      resetTimeout_v3.current = setTimeout(() => {
        try {
          recaptchaV3Ref.current.reset();
          console.log("reCAPTCHA v3 reset successfully");
        } catch (err) {
          console.log("Error resetting reCAPTCHA v3:", err);
        }
      }, 1000);
    }
  };

  const handleResendEmail = async (token_v2 = null) => {
    if (!email || !EMAIL_TEMPLATE.test(email)) {
      Notify.failure(t("invalid_email"));
      console.log(t("invalid_email"));
      return;
    }

    // Базова перевірка чи користувач підключений до мережі (для запобігання зависанню капчі): запобігає спробам відправити запит до сервера або викликати reCAPTCHA, якщо користувач не підключений до Інтернету.
    if (!isOnline) {
      Notify.failure(t("no_internet"));
      console.log(t("no_internet"));
      return;
    }

    const timeoutPromise_v2 = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Operation timeout")), 10000);
    });

    let token_v3 = null;
    let usedCaptchaType = showV2Captcha ? "v2" : "v3"; // Зберігаємо тип CAPTCHA, який використовується

    try {
      if (!showV2Captcha) {
        // console.log("showV2Captcha false, використовую V3");

        try {
          if (!recaptchaV3Ref.current) {
            Notify.failure(t("recaptcha_failed"));
            console.log("reCAPTCHA v3 ref not initialized");
            return;
          }

          const timeoutPromise_v3 = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Operation timeout")), 10000);
          });

          // Використовуємо reCAPTCHA v3
          // executeAsync() викликає reCAPTCHA у фоновому режимі та повертає токен (працює лише для невидимих версій captcha).
          // token_v3 = await recaptchaV3Ref.current.executeAsync();
          token_v3 = await Promise.race([
            recaptchaV3Ref.current.executeAsync(),
            timeoutPromise_v3,
          ]);

          // Обробка помилки, якщо є використання reCAPTCHA v3, але токен не валідний
          if (!token_v3) {
            Notify.failure(t("recaptcha_failed"));
            console.log(t("recaptcha_failed"), token_v3);
            return;
          }
        } catch (err) {
          console.log("Error in reCAPTCHA v3:", err);
          setShowV2Captcha(true);
          return;
        }
      } else if (!token_v2) {
        // Якщо v2 активна, але токен ще не отриманий, чекаємо onChange
        // console.log("Чекаю, поки користувач пройде капчу V2");
        return;
      }

      // console.log(
      //   "Відправлення запиту із email, recaptchaToken і типом CAPTCHA",
      // );
      await Promise.race([
        resendVerificationEmail({
          email,
          recaptchaToken: showV2Captcha ? token_v2 : token_v3,
          captchaType: showV2Captcha ? "v2" : "v3",
        }).unwrap(),
        timeoutPromise_v2,
      ]);

      Notify.success(t("verification_email_sent"));
      console.log(t("verification_email_sent"));

      setShowV2Captcha(false);
      setRecaptchaToken_v2(null);
      navigate("/login");
    } catch (err) {
      console.log(" Виникла якась помилка >> err:::", err);
      const message = err?.data?.message || t("err_no_access");

      if (
        message.includes("reCAPTCHA V3 verification failed") &&
        !showV2Captcha
      ) {
        Notify.info(
          "Підозріла активність, будь ласка підтвердить, що ви не робот",
        );
        // console.log(
        //   "v3 не вдалася, перемикаю на v2 (встановлюю showV2Captcha у true)",
        // );
        setShowV2Captcha(true); // Перемикаємо на v2, якщо v3 не вдалася
        usedCaptchaType = null; // щоб уникнути скидання щойно показаної reCAPTCHA v2
      } else {
        Notify.failure(message);
        console.log(message);
      }
    } finally {
      if (usedCaptchaType) {
        // Викликаємо відкладений reset
        // console.log(`Викликаємо відкладений reset для ${usedCaptchaType}`);
        // не можна робити recaptchaV3Ref.current.reset() чи recaptchaV2Ref.current.reset() синхронно, бо це прериває асинхронні запити google і додаток лагає. Тому використовується таймер у resetCaptcha.

        resetCaptcha(usedCaptchaType); // в цьому коді не обов'язково, бо одразу йде перенаправлення на /login. Тобто компонент розмонтовується і користсувач не може повторно використати токен поточної капчі, а сама капча не залишиться у стані "відмічено". Але на випадок помилки від капчі все одно треба скидати її стан і токен, тому залишається.
      }
    }
  };

  // Обробка токена від reCAPTCHA v2
  const handleV2CaptchaChange = async token_v2 => {
    // console.log("reCAPTCHA v2 token received:", token_v2);
    setRecaptchaToken_v2(token_v2);
    if (token_v2) {
      try {
        await handleResendEmail(token_v2);
      } catch (err) {
        Notify.failure(t("recaptcha_failed"));
        console.log(t("recaptcha_failed"), err);
      }
    } else {
      Notify.failure(t("please_complete_recaptcha"));
      console.log("reCAPTCHA v2 failed or expired");
      console.log(t("please_complete_recaptcha"));
    }
  };

  // Очищення таймера при демонтажі компонента
  useEffect(() => {
    return () => {
      if (resetTimeout_v2.current) clearTimeout(resetTimeout_v2.current);
      if (resetTimeout_v3.current) clearTimeout(resetTimeout_v3.current);
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

        {/* reCAPTCHA v3 (невидимий) */}
        <ReCAPTCHA
          ref={recaptchaV3Ref}
          sitekey={process.env.REACT_APP_GOOGLE_CAPTCHA_V3_DIXIUM}
          size="invisible"
        />

        {showV2Captcha && email && EMAIL_TEMPLATE.test(email) && (
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
          disabled={
            isLoading ||
            (showV2Captcha && !recaptchaToken_v2) ||
            !EMAIL_TEMPLATE.test(email)
          }
          loading={isLoading}
        />
      </div>
    </div>
  );
}
