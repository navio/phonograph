import serviceWorker from "../serviceworker";
import type { PlatformAdapter } from "./types";

const webAdapter: PlatformAdapter = {
  runtime: "web",
  isDesktop: false,
  registerServiceWorker: () => {
    serviceWorker();
  },
};

export default webAdapter;
