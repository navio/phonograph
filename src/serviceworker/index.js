export default () => {
  if ('serviceWorker' in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => console.log("SW Registered"))
        .catch((err) => console.error("failed to register service worker!", err));
    });
  }
}
