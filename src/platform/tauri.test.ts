import { describe, expect, it } from "vitest";
import tauriAdapter from "./tauri";

describe("tauri platform adapter", () => {
  it("exposes desktop runtime metadata", () => {
    expect(tauriAdapter.runtime).toBe("tauri");
    expect(tauriAdapter.isDesktop).toBe(true);
  });

  it("uses a no-op service worker registration", () => {
    expect(() => tauriAdapter.registerServiceWorker()).not.toThrow();
  });
});

