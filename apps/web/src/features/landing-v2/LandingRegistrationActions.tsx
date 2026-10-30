import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useRegistrationMode } from "../auth/context/RegistrationModeContext.js";
import { previewFocus } from "../recovery-dashboard/focus.js";

const primaryClass = `${previewFocus} inline-flex items-center justify-center rounded-xl bg-soma-action px-6 py-3 text-sm font-semibold text-[#081018] transition-colors hover:bg-soma-action-hover`;
const secondaryClass = `${previewFocus} inline-flex items-center justify-center rounded-xl border border-soma-line-strong bg-[#081018]/40 px-6 py-3 text-sm font-medium text-soma-ink-secondary transition-colors hover:border-soma-physiology hover:text-soma-ink`;

export function LandingRegistrationActions({
  copyPrefix,
  layoutClassName,
}: {
  copyPrefix: "hero" | "closing";
  layoutClassName: string;
}) {
  const { t } = useTranslation("landing-v2");
  const registration = useRegistrationMode();

  return (
    <>
      <div className={layoutClassName}>
        {registration.status === "ready" && registration.mode === "open" ? (
          <Link to="/register" className={primaryClass}>
            {t(`${copyPrefix}.ctaPrimary`)}
          </Link>
        ) : null}
        {registration.status === "ready" && registration.mode === "invite" ? (
          <Link to="/login" className={primaryClass}>
            {t(`${copyPrefix}.ctaSignIn`)}
          </Link>
        ) : null}
        <Link to="/preview" className={secondaryClass}>
          {t(`${copyPrefix}.ctaSecondary`)}
        </Link>
      </div>
      {registration.status === "ready" && registration.mode === "invite" ? (
        <p className="mt-4 max-w-xl text-xs leading-relaxed text-soma-ink-muted">
          {t(`${copyPrefix}.ctaInviteNote`)}
        </p>
      ) : null}
      {registration.status === "error" ? (
        <p className="mt-4 max-w-xl text-xs leading-relaxed text-soma-ink-muted">
          {t("registrationUnavailable")}
        </p>
      ) : null}
    </>
  );
}
