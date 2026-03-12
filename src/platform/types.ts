export type PlatformRuntime = "web" | "tauri";

export interface PlatformAdapter {
  runtime: PlatformRuntime;
  isDesktop: boolean;
  registerServiceWorker: () => void;
  resolveBackendUrl: (path: string) => string;
  resolveShareUrl: (path: string) => string;
}
