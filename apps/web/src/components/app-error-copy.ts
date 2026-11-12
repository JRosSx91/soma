import i18next from "i18next";
import enCommon from "../i18n/locales/en/common.json";
import esCommon from "../i18n/locales/es/common.json";
import {
  resolveInterfaceLanguage,
  type InterfaceLanguage,
} from "../i18n/interface-languages.js";

export type AppErrorCopy = typeof enCommon.errorBoundary;

const APP_ERROR_COPY: Record<InterfaceLanguage, AppErrorCopy> = {
  es: esCommon.errorBoundary,
  en: enCommon.errorBoundary,
};

export interface AppErrorLanguageSources {
  i18nLanguage?: string;
  documentLanguage?: string;
  navigatorLanguage?: string;
}

/**
 * Read without React context: the root boundary may render after a provider
 * failed, so the copy must not depend on I18nextProvider or hooks.
 */
export function currentAppErrorLanguageSources(): AppErrorLanguageSources {
  return {
    i18nLanguage: i18next.resolvedLanguage ?? i18next.language,
    documentLanguage:
      typeof document !== "undefined" ? document.documentElement.lang : undefined,
    navigatorLanguage:
      typeof navigator !== "undefined" ? navigator.language : undefined,
  };
}

export function resolveAppErrorCopy(
  sources: AppErrorLanguageSources = currentAppErrorLanguageSources(),
): AppErrorCopy {
  const language =
    sources.i18nLanguage ||
    sources.documentLanguage ||
    sources.navigatorLanguage ||
    "en";
  return APP_ERROR_COPY[resolveInterfaceLanguage(language)];
}
