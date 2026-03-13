import { describe, expect, it } from "vitest";
import { createPlatformAdapter } from "./index";

describe("platform adapter", () => {
  it("returns web adapter by default", () => {
    const adapter = createPlatformAdapter(false);
    expect(adapter.runtime).toBe("web");
    expect(adapter.isDesktop).toBe(false);
    expect(adapter.resolveBackendUrl("/apple/search?term=foo")).toBe("/apple/search?term=foo");
    expect(adapter.resolveShareUrl("/podcast/abc")).toContain("/podcast/abc");
  });

  it("returns tauri adapter when tauri runtime is active", () => {
    const adapter = createPlatformAdapter(true);
    expect(adapter.runtime).toBe("tauri");
    expect(adapter.isDesktop).toBe(true);
    expect(adapter.resolveBackendUrl("/apple/search?term=foo")).toBe("https://phonograph.app/apple/search?term=foo");
    expect(adapter.resolveShareUrl("/podcast/abc")).toBe("https://phonograph.app/podcast/abc");
  });

  it("preserves fully-qualified URLs", () => {
    const webAdapter = createPlatformAdapter(false);
    const tauriAdapter = createPlatformAdapter(true);
    const absoluteUrl = "https://example.com/path";

    expect(webAdapter.resolveBackendUrl(absoluteUrl)).toBe(absoluteUrl);
    expect(tauriAdapter.resolveBackendUrl(absoluteUrl)).toBe(absoluteUrl);
    expect(webAdapter.resolveShareUrl(absoluteUrl)).toBe(absoluteUrl);
    expect(tauriAdapter.resolveShareUrl(absoluteUrl)).toBe(absoluteUrl);
  });
});
