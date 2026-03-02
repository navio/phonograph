import React from "react";
import { IntlProvider } from "react-intl";
import { useAppStore } from "../store/appStore";
import { DEFAULT_LOCALE, getBrowserLocale, type SupportedLocale } from "./locale";
import { getMessages } from "./translations";

interface IntlWrapperProps {
  children: React.ReactNode;
}

/**
 * IntlWrapper reads the locale from the app store and provides IntlProvider
 * with the appropriate messages. It reacts to locale changes in the store.
 */
export const IntlWrapper: React.FC<IntlWrapperProps> = ({ children }) => {
  // Read locale from store; fall back to browser locale if not set
  const storedLocale = useAppStore((s) => s.state.locale);
  const locale: SupportedLocale = storedLocale || getBrowserLocale();
  const messages = getMessages(locale);

  return (
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export default IntlWrapper;
