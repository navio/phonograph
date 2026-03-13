/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_COMMIT_REF?: string;
  readonly VITE_DEPLOY_ID?: string;
  readonly VITE_DESKTOP_API_ORIGIN?: string;
  readonly VITE_PUBLIC_WEB_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __TAURI_INTERNALS__?: unknown;
}
