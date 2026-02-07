export default () => {
  if ("serviceWorker" in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener("load", () => {
      let refreshing = false;

      const skipWaiting = (registration) => {
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      };

      const listenForUpdate = (registration) => {
        if (!registration) {
          return;
        }
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) {
            return;
          }
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              skipWaiting(registration);
            }
          });
        });
      };

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) {
          return;
        }
        refreshing = true;
        window.location.reload();
      });

      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("SW Registered");
          skipWaiting(registration);
          listenForUpdate(registration);
          registration.update();
        })
        .catch(() => console.error("failed to register service worker!"));
    });
  }
}
