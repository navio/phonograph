import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import App from "./App";
import serviceWorker from "./serviceworker";
import i18n from "./i18n";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <Router>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </Router>
  );
}

serviceWorker();
