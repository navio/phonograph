interface TauriDialogFilter {
  name: string;
  extensions: string[];
}

interface TauriDialogApi {
  open: (options?: {
    multiple?: boolean;
    directory?: boolean;
    filters?: TauriDialogFilter[];
    defaultPath?: string;
    title?: string;
  }) => Promise<string | string[] | null>;
  save: (options?: {
    filters?: TauriDialogFilter[];
    defaultPath?: string;
    title?: string;
  }) => Promise<string | null>;
}

interface TauriFsApi {
  readTextFile?: (path: string) => Promise<string>;
  writeTextFile?: ((path: string, contents: string) => Promise<void>) | ((args: { path: string; contents: string }) => Promise<void>);
  writeFile?: (args: { path: string; contents: string | number[] | Uint8Array }) => Promise<void>;
}

const OPML_DIALOG_FILTERS: TauriDialogFilter[] = [{
  name: "OPML/XML",
  extensions: ["opml", "xml"],
}];

const getWindowAny = () => {
  if (typeof window === "undefined") return null;
  return window as unknown as Record<string, any>;
};

const getTauriDialogApi = (): TauriDialogApi | null => {
  const win = getWindowAny();
  if (!win) return null;

  const tauriDialog = win.__TAURI__?.dialog;
  if (tauriDialog?.open && tauriDialog?.save) {
    return tauriDialog as TauriDialogApi;
  }

  const internalsDialog = win.__TAURI_INTERNALS__?.plugins?.dialog;
  if (internalsDialog?.open && internalsDialog?.save) {
    return internalsDialog as TauriDialogApi;
  }

  return null;
};

const getTauriFsApi = (): TauriFsApi | null => {
  const win = getWindowAny();
  if (!win) return null;

  const tauriFs = win.__TAURI__?.fs;
  if (tauriFs?.readTextFile && (tauriFs?.writeTextFile || tauriFs?.writeFile)) {
    return tauriFs as TauriFsApi;
  }

  const internalsFs = win.__TAURI_INTERNALS__?.plugins?.fs;
  if (internalsFs?.readTextFile && (internalsFs?.writeTextFile || internalsFs?.writeFile)) {
    return internalsFs as TauriFsApi;
  }

  return null;
};

const getFilenameFromPath = (path: string) => {
  const chunks = path.split(/[\\/]/).filter(Boolean);
  return chunks[chunks.length - 1] || "subscriptions.opml";
};

const writeTextFile = async (fsApi: TauriFsApi, path: string, contents: string) => {
  if (fsApi.writeTextFile) {
    try {
      await (fsApi.writeTextFile as (path: string, contents: string) => Promise<void>)(path, contents);
      return;
    } catch (_error) {
      await (fsApi.writeTextFile as (args: { path: string; contents: string }) => Promise<void>)({ path, contents });
      return;
    }
  }

  if (fsApi.writeFile) {
    await fsApi.writeFile({ path, contents });
    return;
  }

  throw new Error("Native file-write API is unavailable.");
};

export const hasNativeOpmlDialogs = () => Boolean(getTauriDialogApi() && getTauriFsApi());

export const importOpmlFromNativeDialog = async (): Promise<{ text: string; fileName: string } | null> => {
  const dialogApi = getTauriDialogApi();
  const fsApi = getTauriFsApi();

  if (!dialogApi || !fsApi?.readTextFile) {
    return null;
  }

  const selectedPath = await dialogApi.open({
    title: "Import OPML",
    directory: false,
    multiple: false,
    filters: OPML_DIALOG_FILTERS,
  });

  if (!selectedPath || Array.isArray(selectedPath)) {
    return null;
  }

  const text = await fsApi.readTextFile(selectedPath);

  return {
    text,
    fileName: getFilenameFromPath(selectedPath),
  };
};

export type NativeOpmlExportStatus = "saved" | "cancelled" | "unsupported";

export const exportOpmlWithNativeDialog = async (
  opmlContents: string,
  suggestedFileName: string
): Promise<NativeOpmlExportStatus> => {
  const dialogApi = getTauriDialogApi();
  const fsApi = getTauriFsApi();

  if (!dialogApi || !fsApi) {
    return "unsupported";
  }

  const selectedPath = await dialogApi.save({
    title: "Export OPML",
    defaultPath: suggestedFileName,
    filters: OPML_DIALOG_FILTERS,
  });

  if (!selectedPath) {
    return "cancelled";
  }

  await writeTextFile(fsApi, selectedPath, opmlContents);
  return "saved";
};

