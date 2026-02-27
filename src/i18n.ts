import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
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

export default i18n;
