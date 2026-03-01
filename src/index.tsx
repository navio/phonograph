import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { IntlProvider } from "react-intl";
import App from "./App";
import serviceWorker from "./serviceworker";
import { getRuntimeLocale, DEFAULT_LOCALE } from "./i18n/locale";

const locale = getRuntimeLocale();

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={{}}>
      <Router>
        <App />
      </Router>
    </IntlProvider>
  );
}

serviceWorker();
