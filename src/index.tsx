import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import serviceWorker from "./serviceworker";
import { initPlatform } from "./platform/api";

const IS_DESKTOP = process.env.PLATFORM === "desktop";
const Router = IS_DESKTOP ? HashRouter : BrowserRouter;

const reportError = (err: any) => {
  const details = [
    err?.stack,
    err?.message,
    err?.name,
    typeof err === "string" ? err : null,
    err ? JSON.stringify(err, null, 2) : null,
  ].filter(Boolean);
  const message = details.length ? details.join("\n") : String(err);
  console.error(err);
  const pre = document.createElement("pre");
  pre.style.cssText = "white-space: pre-wrap; color: #b00020; padding: 16px;";
  pre.textContent = `Phonograph startup error:\n${message}`;
  document.body.appendChild(pre);
};

window.addEventListener("error", (event) => {
  reportError((event as ErrorEvent).error || (event as ErrorEvent).message);
});

window.addEventListener("unhandledrejection", (event) => {
  reportError((event as PromiseRejectionEvent).reason);
});

const setupPlatform = async () => {
  if (IS_DESKTOP) {
    const [{ Electroview }, { desktopPlatform }] = await Promise.all([
      import("electrobun/view"),
      import("./platform/api.desktop"),
    ]);
    const rpc = Electroview.defineRPC({
      maxRequestTime: 15000,
      handlers: {
        requests: {},
        messages: {},
      },
    });
    const view = new Electroview({ rpc });
    initPlatform(desktopPlatform(view));
  } else {
    const { webPlatform } = await import("./platform/api.web");
    initPlatform(webPlatform);
    serviceWorker();
  }
};

setupPlatform()
  .catch((error) => {
    reportError(error);
  })
  .finally(() => {
    const container = document.getElementById("root");
    if (!container) return;
    createRoot(container).render(
      <Router>
        <App />
      </Router>
    );
  });
