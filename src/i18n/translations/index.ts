import type { SupportedLocale } from "../locale";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import zh from "./zh.json";

export type Messages = Record<string, string>;

const translations: Record<SupportedLocale, Messages> = {
  en,
  es,
  fr,
  zh,
};

/**
 * Get messages for a given locale.
 * Falls back to English if the locale is not supported.
 * Supports both full locales (e.g., "en-US") and language codes (e.g., "en").
 */
export function getMessages(locale: string): Messages {
  // Try exact match first
  if (translations[locale]) {
    return translations[locale];
  }

  // Try language code only (e.g., "en" from "en-US")
  const languageCode = locale.split("-")[0];
  if (translations[languageCode]) {
    return translations[languageCode];
  }

  // Fall back to English
  return translations.en;
}

export { en, es, fr, zh };
