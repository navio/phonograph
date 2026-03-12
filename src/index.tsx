import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import { IntlWrapper } from "./i18n/IntlWrapper";
import platform from "./platform";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <IntlWrapper>
      <Router>
        <App />
      </Router>
    </IntlWrapper>
  );
}

platform.registerServiceWorker();
