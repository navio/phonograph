/**
 * Locale detection and normalization utilities for react-intl.
 */

const SUPPORTED_LOCALES = ["en"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: SupportedLocale = "en";

/**
 * Normalize a locale string to a supported locale.
 * e.g. "en-US" -> "en", "fr-CA" -> "en" (fallback)
 */
export function normalizeLocale(locale: string): SupportedLocale {
  const lang = locale.split("-")[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    return lang as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Detect the user's preferred locale from the browser.
 * Returns a normalized supported locale.
 */
export function getRuntimeLocale(): SupportedLocale {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }

  // navigator.languages is an array of preferred locales
  const languages = navigator.languages || [navigator.language];
  for (const lang of languages) {
    const normalized = normalizeLocale(lang);
    if (SUPPORTED_LOCALES.includes(normalized)) {
      return normalized;
    }
  }

  return DEFAULT_LOCALE;
}

export { DEFAULT_LOCALE, SUPPORTED_LOCALES };
export type { SupportedLocale };
