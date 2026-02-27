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

const LanguageDetectorPlugin: any = (LanguageDetector as any)?.default ?? LanguageDetector;

const updateHtmlLangDir = (lng?: string) => {
  if (typeof document === "undefined") return;

  const html = document.documentElement;
  if (!html) return;

  const language = lng || i18n.resolvedLanguage || i18n.language || "en";

  let dir = "ltr";
  try {
    dir = i18n.dir(language) || "ltr";
  } catch {
    dir = "ltr";
  }

  try {
    html.lang = language;
    html.dir = dir;
  } catch {
    // ignore if not in a browser environment
  }
};

let domListenersAttached = false;
const attachDomListenersOnce = () => {
  if (domListenersAttached) return;
  domListenersAttached = true;

  // Initialize direction based on detected language and keep it in sync.
  updateHtmlLangDir();
  i18n.on("languageChanged", updateHtmlLangDir);
};

if (typeof document !== "undefined") {
  // Wait for i18n initialization before touching i18n.dir() / language.
  i18n.on("initialized", attachDomListenersOnce);

  // Hot-reload / re-import safety.
  if (i18n.isInitialized) {
    attachDomListenersOnce();
  }
}

i18n.use(LanguageDetectorPlugin).use(initReactI18next).init({
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

export default i18n;
