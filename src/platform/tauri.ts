import type { PlatformAdapter } from "./types";

const tauriAdapter: PlatformAdapter = {
  runtime: "tauri",
  isDesktop: true,
  registerServiceWorker: () => {},
};

export default tauriAdapter;
