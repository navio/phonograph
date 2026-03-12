import { describe, expect, it } from "vitest";
import { createPlatformAdapter } from "./index";

describe("platform adapter", () => {
  it("returns web adapter by default", () => {
    const adapter = createPlatformAdapter(false);
    expect(adapter.runtime).toBe("web");
    expect(adapter.isDesktop).toBe(false);
  });

  it("returns tauri adapter when tauri runtime is active", () => {
    const adapter = createPlatformAdapter(true);
    expect(adapter.runtime).toBe("tauri");
    expect(adapter.isDesktop).toBe(true);
  });
});
