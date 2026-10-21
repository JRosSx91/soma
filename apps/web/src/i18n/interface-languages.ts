/**
 * Languages offered in the UI. Resource bundles for other supported
 * codes stay registered for editorial work; they are not selectable.
 *
 * Iberian unpublished codes map to Spanish; everything else maps to English.
 */
export const INTERFACE_LANGUAGES = ["es", "en"] as const;
export type InterfaceLanguage = (typeof INTERFACE_LANGUAGES)[number];

const IBERIAN_TO_SPANISH = new Set(["es", "ca", "gl", "eu"]);

export function isInterfaceLanguage(code: string): code is InterfaceLanguage {
  return (INTERFACE_LANGUAGES as readonly string[]).includes(code);
}

export function resolveInterfaceLanguage(lng: string): InterfaceLanguage {
  const code = lng.split("-")[0]?.toLowerCase() ?? "en";
  if (IBERIAN_TO_SPANISH.has(code)) return "es";
  return "en";
}
