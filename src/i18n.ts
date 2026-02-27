import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import ar from "./locales/ar/translation.json";
import de from "./locales/de/translation.json";
import en from "./locales/en/translation.json";
import eo from "./locales/eo/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";
import hi from "./locales/hi/translation.json";
import it from "./locales/it/translation.json";
import ptBR from "./locales/pt-BR/translation.json";
import zhCN from "./locales/zh-CN/translation.json";

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    de: { translation: de },
    en: { translation: en },
    eo: { translation: eo },
    es: { translation: es },
    fr: { translation: fr },
    hi: { translation: hi },
    it: { translation: it },
    "pt-BR": { translation: ptBR },
    "zh-CN": { translation: zhCN },
  },
  fallbackLng: "en",
  debug: false,
  detection: {
    // Check localStorage first, then the browser navigator, then htmlTag
    order: ["localStorage", "navigator", "htmlTag"],
    // Persist user language to localStorage
    caches: ["localStorage"],
    lookupLocalStorage: "i18nextLng",
  },
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

// Ensure document direction (ltr/rtl) and lang attribute follow the active language.
// This updates dynamically on language changes (important for Arabic / RTL).
if (typeof document !== "undefined") {
  const setHtmlDirection = (lng?: string) => {
    const language = lng || i18n.language || "en";
    try {
      document.documentElement.lang = language;
      document.documentElement.dir = i18n.dir(language) || "ltr";
    } catch (e) {
      // ignore if not in a browser environment
    }
  };

  // Initialize direction based on detected language
  setHtmlDirection();

  // Update on language change
  i18n.on("languageChanged", (lng) => {
    setHtmlDirection(lng);
  });
}

export default i18n;
