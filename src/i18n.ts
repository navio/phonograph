import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";
import fr from "./locales/fr/translation.json";
import ptBR from "./locales/pt-BR/translation.json";
import zhCN from "./locales/zh-CN/translation.json";
import hi from "./locales/hi/translation.json";
import it from "./locales/it/translation.json";
import ar from "./locales/ar/translation.json";
import de from "./locales/de/translation.json";
import eo from "./locales/eo/translation.json";

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  "pt-BR": { translation: ptBR },
  "zh-CN": { translation: zhCN },
  hi: { translation: hi },
  it: { translation: it },
  ar: { translation: ar },
  de: { translation: de },
  eo: { translation: eo },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      // Order and from where user language should be detected
      order: ["localStorage", "navigator"],
      // keys or params to lookup language from
      lookupLocalStorage: "phonograph_language",
      // cache user language on
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
    },
  });

const setDocumentDir = (lng: string) => {
  if (lng === "ar") {
    document.documentElement.dir = "rtl";
  } else {
    document.documentElement.dir = "ltr";
  }
  try {
    localStorage.setItem("phonograph_language", lng);
  } catch (e) {
    // ignore
  }
};

setDocumentDir(i18n.language || "en");

i18n.on("languageChanged", (lng) => {
  setDocumentDir(lng);
});

export default i18n;
