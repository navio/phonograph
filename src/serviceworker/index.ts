const registerServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("SW Registered"))
        .catch((err) => console.error("failed to register service worker!", err));
    });
  }
};

export default registerServiceWorker;
