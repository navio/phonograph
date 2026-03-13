import { afterEach, describe, expect, it, vi } from "vitest";
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
});

describe("opmlDialogs", () => {
  it("reports unsupported when native APIs are absent", async () => {
    setWindow(undefined);

    await expect(importOpmlFromNativeDialog()).resolves.toEqual({ status: "unsupported" });
    await expect(exportOpmlWithNativeDialog("<opml />", "subs.opml")).resolves.toBe("unsupported");
  });

  it("imports OPML text using native open/read APIs", async () => {
    const open = vi.fn().mockResolvedValue("/Users/alnavarro/Downloads/subscriptions.opml");
    const readTextFile = vi.fn().mockResolvedValue("<opml>hello</opml>");

    setWindow({
      __TAURI__: {
        dialog: { open, save: vi.fn() },
        fs: { readTextFile, writeTextFile: vi.fn() },
      },
    });

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
    const save = vi.fn().mockResolvedValue("/Users/alnavarro/Documents/subs.opml");
    const writeTextFile = vi.fn().mockResolvedValue(undefined);

    setWindow({
      __TAURI__: {
        dialog: { open: vi.fn(), save },
        fs: { readTextFile: vi.fn(), writeTextFile },
      },
    });

    const status = await exportOpmlWithNativeDialog("<opml>content</opml>", "subs.opml");

    expect(status).toBe("saved");
    expect(save).toHaveBeenCalled();
    expect(writeTextFile).toHaveBeenCalledWith("/Users/alnavarro/Documents/subs.opml", "<opml>content</opml>");
  });

  it("returns cancelled when native save dialog is dismissed", async () => {
    setWindow({
      __TAURI__: {
        dialog: { open: vi.fn(), save: vi.fn().mockResolvedValue(null) },
        fs: { readTextFile: vi.fn(), writeTextFile: vi.fn() },
      },
    });

    await expect(exportOpmlWithNativeDialog("<opml>content</opml>", "subs.opml")).resolves.toBe("cancelled");
  });
});
