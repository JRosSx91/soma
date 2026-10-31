import { resolveInterfaceLanguage } from "./interface-languages.js";

/** Storage key used by i18next LanguageDetector (`lookupLocalStorage`). */
export const INTERFACE_LANGUAGE_STORAGE_KEY = "soma.i18n.lang";

/**
 * Keep `document.documentElement.lang` aligned with the interface language.
 * Does not persist preferences; i18next remains the source of truth.
 */
export function syncDocumentLanguage(lng: string): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = resolveInterfaceLanguage(lng);
}
