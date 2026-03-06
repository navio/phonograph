/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION?: string;
  readonly VITE_COMMIT_REF?: string;
  readonly VITE_DEPLOY_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
