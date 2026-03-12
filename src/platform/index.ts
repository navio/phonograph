import tauriAdapter from "./tauri";
import webAdapter from "./web";
import type { PlatformAdapter } from "./types";

const detectTauriRuntime = () =>
  typeof window !== "undefined" && typeof window.__TAURI_INTERNALS__ !== "undefined";

export const createPlatformAdapter = (isTauriRuntime = detectTauriRuntime()): PlatformAdapter =>
  isTauriRuntime ? tauriAdapter : webAdapter;

const platform = createPlatformAdapter();

export default platform;
