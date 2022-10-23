export default () => {
  if ('serviceWorker' in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(new URL('./worker.js', import.meta.url), {registrationStrategy: 'registerImmediately', type: 'module'})
        .then(() => console.log("SW Registered"))
        .catch(() => console.error("failed to register service worker!"));
    });
  }
}