import { useState, type ChangeEventHandler } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { previewFocus } from "../../recovery-dashboard/focus.js";
import { authFieldClass } from "./AuthShell.js";

interface AuthPasswordFieldProps {
  id?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  minLength?: number;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function AuthPasswordField({
  id,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: AuthPasswordFieldProps) {
  const { t } = useTranslation("auth");
  const [revealed, setRevealed] = useState(false);
  const inputType = revealed ? "text" : "password";

  return (
    <div className="relative">
      <input
        id={id}
        type={inputType}
        required={required}
        minLength={minLength}
        value={value}
        onChange={onChange}
        className={`${authFieldClass} pr-11`}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
      />
      <button
        type="button"
        className={`${previewFocus} absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-soma-ink-muted transition-colors hover:text-soma-ink`}
        onClick={() => setRevealed((current) => !current)}
        aria-label={revealed ? t("passwordVisibility.hide") : t("passwordVisibility.show")}
        aria-pressed={revealed}
      >
        {revealed ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
