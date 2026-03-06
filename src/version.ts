import { version as packageVersion } from "../package.json";

export const APP_VERSION = import.meta.env.VITE_APP_VERSION || packageVersion;
export const APP_COMMIT_REF = import.meta.env.VITE_COMMIT_REF || "";
export const APP_DEPLOY_ID = import.meta.env.VITE_DEPLOY_ID || "";
