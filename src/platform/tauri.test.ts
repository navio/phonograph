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

  it("resolves backend URLs to the hosted API origin", () => {
    expect(tauriAdapter.resolveBackendUrl("/ln/search?q=test")).toBe("https://phonograph.app/ln/search?q=test");
  });

  it("resolves share URLs to the public web origin", () => {
    expect(tauriAdapter.resolveShareUrl("/podcast/abc")).toBe("https://phonograph.app/podcast/abc");
  });
});
