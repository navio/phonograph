export type PlatformRuntime = "web" | "tauri";

export interface PlatformAdapter {
  runtime: PlatformRuntime;
  isDesktop: boolean;
  registerServiceWorker: () => void;
}
