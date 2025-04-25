import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Notify } from "notiflix";

import { setPageHeaderText } from "redux/game/localPersonalSlice.js";
import { useResendVerificationEmailMutation } from "redux/auth/authApi.js";
import Button from "common/components/ui/Button";

import css from "./VerifyEmailPage.scss";

export default function VerifyEmailPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [resendVerificationEmail, { isLoading }] =
    useResendVerificationEmailMutation();
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(setPageHeaderText(t("verify_email")));
  }, [dispatch, t]);

  const handleResendEmail = async () => {
    try {
      await resendVerificationEmail().unwrap();
      Notify.success(t("verification_email_sent"));
      setError(null);
    } catch (err) {
      const message = err.data?.message || t("err_no_access");
      setError(message);
      Notify.failure(message);
    }
  };

  return (
    <div className={css.container}>
      <div className={css.pageMain}>
        <h2>{t("verify_email")}</h2>
        <p>{t("verify_email_message")}</p>

        {error && <p className={css.error}>{error}</p>}

        <Button
          btnText={t("resend_verification_email")}
          onClick={handleResendEmail}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
