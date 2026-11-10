import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DetailSheet } from "../recovery-dashboard/components/DetailSheet.js";
import { previewFocus } from "../recovery-dashboard/focus.js";
import type { PwaInstallPhase, PwaInstructionKind } from "./pwa-install.js";
import { usePwaInstall } from "./usePwaInstall.js";

export function InstallSomaControl({
  tone,
}: {
  tone: "footer" | "account";
}) {
  const { t } = useTranslation("pwa");
  const install = usePwaInstall();
  const [open, setOpen] = useState(false);

  if (!install.offer && !open) return null;

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const trigger = (
    <button
      type="button"
      className={
        tone === "footer"
          ? `${previewFocus} rounded-sm text-xs text-soma-ink-muted hover:text-soma-action`
          : `${previewFocus} mt-3 inline-flex rounded-xl border border-soma-line px-4 py-2 text-sm text-soma-ink hover:bg-soma-raised`
      }
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={openDialog}
    >
      {t("installAction")}
    </button>
  );

  const dialog = open ? (
    <DetailSheet title={t("dialogTitle")} onClose={closeDialog}>
      <InstallSomaDialogBody
        kind={install.kind}
        phase={install.phase}
        iosSafari={install.iosSafari}
        prompting={install.prompting}
        onPrompt={() => {
          void install.promptNativeInstall();
        }}
      />
    </DetailSheet>
  ) : null;

  if (tone === "account") {
    return (
      <>
        <section className="rounded-2xl border border-soma-line bg-soma-surface/60 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-soma-ink">
            {t("accountTitle")}
          </h2>
          <p className="mt-1 text-sm text-soma-ink-secondary">
            {t("accountHint")}
          </p>
          {install.offer ? trigger : null}
        </section>
        {dialog}
      </>
    );
  }

  return (
    <>
      {install.offer ? trigger : null}
      {dialog}
    </>
  );
}

export function InstallSomaDialogBody({
  kind,
  phase,
  iosSafari,
  prompting,
  onPrompt,
}: {
  kind: PwaInstructionKind;
  phase: PwaInstallPhase;
  iosSafari: boolean;
  prompting: boolean;
  onPrompt: () => void;
}) {
  const { t } = useTranslation("pwa");

  return (
    <div className="space-y-3 text-sm leading-relaxed text-soma-ink-secondary">
      <p>{t("intro")}</p>
      <p>{t("needsNetwork")}</p>
      <p>{t("noStores")}</p>
      {phase === "confirmed" ? (
        <p role="status">{t("outcomeConfirmed")}</p>
      ) : null}
      {phase === "accepted" ? (
        <p role="status">{t("outcomeAccepted")}</p>
      ) : null}
      {phase === "dismissed" ? (
        <p role="status">{t("outcomeDismissed")}</p>
      ) : null}
      {phase === "unknown" ? (
        <p role="status">{t("outcomeUnknown")}</p>
      ) : null}
      {kind === "prompt" ? (
        <>
          <p>{t("promptHint")}</p>
          <button
            type="button"
            disabled={prompting}
            onClick={onPrompt}
            className={`${previewFocus} rounded-xl bg-soma-action px-4 py-2 text-sm font-medium text-[#081018] disabled:opacity-50`}
          >
            {prompting ? t("promptBusy") : t("promptCta")}
          </button>
        </>
      ) : null}
      {kind === "pending" ? <p>{t("outcomePendingHint")}</p> : null}
      {kind === "ios" ? (
        <div>
          <p className="font-medium text-soma-ink">{t("iosTitle")}</p>
          <p className="mt-2">{iosSafari ? t("iosSafari") : t("iosOther")}</p>
          <p className="mt-2">{t("iosVersionNote")}</p>
        </div>
      ) : null}
      {kind === "manual" ? (
        <div>
          <p className="font-medium text-soma-ink">{t("manualTitle")}</p>
          <p className="mt-2">{t("manualChrome")}</p>
          <p className="mt-2">{t("manualGeneric")}</p>
        </div>
      ) : null}
    </div>
  );
}
