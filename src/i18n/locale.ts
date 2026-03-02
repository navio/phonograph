/**
 * Locale detection and normalization utilities for react-intl.
 */

export const SUPPORTED_LOCALES = ["en", "es", "fr", "zh"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

/** Human-readable labels for each supported locale */
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "中文",
};

/**
 * Normalize a locale string to a supported locale.
 * e.g. "en-US" -> "en", "es-MX" -> "es", "unknown" -> "en" (fallback)
 */
export function normalizeLocale(locale: string): SupportedLocale {
  const lang = locale.split("-")[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
    return lang as SupportedLocale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Get stored locale from localStorage app state, if any.
 */
export function getStoredLocale(): SupportedLocale | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem("state");
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (state.locale && SUPPORTED_LOCALES.includes(state.locale)) {
      return state.locale as SupportedLocale;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Detect the user's preferred locale from the browser.
 * Returns a normalized supported locale.
 */
export function getBrowserLocale(): SupportedLocale {
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

/**
 * Get the runtime locale: stored preference > browser detection > default.
 */
export function getRuntimeLocale(): SupportedLocale {
  return getStoredLocale() || getBrowserLocale();
}
