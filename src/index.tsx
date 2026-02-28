import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { IntlProvider } from "react-intl";
import App from "./App";
import serviceWorker from "./serviceworker";
import { locale, messages } from "./i18n";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <IntlProvider locale={locale} messages={messages} defaultLocale={locale}>
      <Router>
        <App />
      </Router>
    </IntlProvider>
  );
}

serviceWorker();
