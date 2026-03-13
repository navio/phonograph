import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn(),
  save: vi.fn(),
}));

vi.mock("@tauri-apps/plugin-fs", () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));

import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { exportOpmlWithNativeDialog, importOpmlFromNativeDialog } from "./opmlDialogs";

const setWindow = (value: any) => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value,
  });
};

afterEach(() => {
  setWindow(undefined);
  vi.clearAllMocks();
});

describe("opmlDialogs", () => {
  it("reports unsupported when tauri runtime is absent", async () => {
    setWindow(undefined);

    await expect(importOpmlFromNativeDialog()).resolves.toEqual({ status: "unsupported" });
    await expect(exportOpmlWithNativeDialog("<opml />", "subs.opml")).resolves.toBe("unsupported");
  });

  it("imports OPML text using native open/read APIs", async () => {
    setWindow({ __TAURI_INTERNALS__: {} });

    vi.mocked(open).mockResolvedValue("/Users/alnavarro/Downloads/subscriptions.opml");
    vi.mocked(readTextFile).mockResolvedValue("<opml>hello</opml>");

    const result = await importOpmlFromNativeDialog();

    expect(result).toEqual({
      status: "selected",
      text: "<opml>hello</opml>",
      fileName: "subscriptions.opml",
    });
    expect(open).toHaveBeenCalled();
    expect(readTextFile).toHaveBeenCalledWith("/Users/alnavarro/Downloads/subscriptions.opml");
  });

  it("exports OPML text with native save/write APIs", async () => {
    setWindow({ __TAURI_INTERNALS__: {} });

    vi.mocked(save).mockResolvedValue("/Users/alnavarro/Documents/subs.opml");
    vi.mocked(writeTextFile).mockResolvedValue(undefined);

    const status = await exportOpmlWithNativeDialog("<opml>content</opml>", "subs.opml");

    expect(status).toBe("saved");
    expect(save).toHaveBeenCalled();
    expect(writeTextFile).toHaveBeenCalledWith("/Users/alnavarro/Documents/subs.opml", "<opml>content</opml>");
  });

  it("returns cancelled when native dialogs are dismissed", async () => {
    setWindow({ __TAURI_INTERNALS__: {} });

    vi.mocked(open).mockResolvedValue(null);
    vi.mocked(save).mockResolvedValue(null);

    await expect(importOpmlFromNativeDialog()).resolves.toEqual({ status: "cancelled" });
    await expect(exportOpmlWithNativeDialog("<opml>content</opml>", "subs.opml")).resolves.toBe("cancelled");
  });
});
