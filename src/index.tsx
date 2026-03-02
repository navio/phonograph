import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import serviceWorker from "./serviceworker";
import { IntlWrapper } from "./i18n/IntlWrapper";

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

serviceWorker();
