import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

interface TauriDialogFilter {
  name: string;
  extensions: string[];
}

type TauriFilePath = string | URL;

const OPML_DIALOG_FILTERS: TauriDialogFilter[] = [{
  name: "OPML/XML",
  extensions: ["opml", "xml"],
}];

const isTauriRuntime = () =>
  typeof window !== "undefined" && typeof window.__TAURI_INTERNALS__ !== "undefined";

const pathToString = (path: TauriFilePath) =>
  typeof path === "string" ? path : decodeURIComponent(path.pathname);

const getFilenameFromPath = (path: TauriFilePath) => {
  const normalizedPath = pathToString(path);
  const chunks = normalizedPath.split(/[\\/]/).filter(Boolean);
  return chunks[chunks.length - 1] || "subscriptions.opml";
};

export type NativeOpmlImportResult =
  | { status: "selected"; text: string; fileName: string }
  | { status: "cancelled" }
  | { status: "unsupported" };

export const importOpmlFromNativeDialog = async (): Promise<NativeOpmlImportResult> => {
  if (!isTauriRuntime()) {
    return { status: "unsupported" };
  }

  const selectedPath = await open({
    title: "Import OPML",
    directory: false,
    multiple: false,
    filters: OPML_DIALOG_FILTERS,
  });

  if (!selectedPath || Array.isArray(selectedPath)) {
    return { status: "cancelled" };
  }

  const text = await readTextFile(selectedPath);

  return {
    status: "selected",
    text,
    fileName: getFilenameFromPath(selectedPath),
  };
};

export type NativeOpmlExportStatus = "saved" | "cancelled" | "unsupported";

export const exportOpmlWithNativeDialog = async (
  opmlContents: string,
  suggestedFileName: string
): Promise<NativeOpmlExportStatus> => {
  if (!isTauriRuntime()) {
    return "unsupported";
  }

  const selectedPath = await save({
    title: "Export OPML",
    defaultPath: suggestedFileName,
    filters: OPML_DIALOG_FILTERS,
  });

  if (!selectedPath) {
    return "cancelled";
  }

  await writeTextFile(selectedPath, opmlContents);
  return "saved";
};
