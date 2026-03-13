import { describe, expect, it, vi } from "vitest";
import webAdapter from "./web";
import serviceWorker from "../serviceworker";

vi.mock("../serviceworker", () => ({
  default: vi.fn(),
}));

describe("web platform adapter", () => {
  it("registers service worker", () => {
    webAdapter.registerServiceWorker();
    expect(serviceWorker).toHaveBeenCalledTimes(1);
  });

  it("keeps backend URLs relative for proxying", () => {
    expect(webAdapter.resolveBackendUrl("/ln/search?q=test")).toBe("/ln/search?q=test");
  });

  it("builds share URLs from current origin", () => {
    expect(webAdapter.resolveShareUrl("/podcast/abc")).toContain("/podcast/abc");
  });
});
