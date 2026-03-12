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
});

