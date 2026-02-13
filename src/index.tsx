import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import serviceWorker from "./serviceworker";

const container = document.getElementById("root");

if (container) {
  createRoot(container).render(
    <Router>
      <App />
    </Router>
  );
}

serviceWorker();
