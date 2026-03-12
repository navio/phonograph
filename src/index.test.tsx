import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createRootMock = vi.fn();
const renderMock = vi.fn();
const registerServiceWorkerMock = vi.fn();

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}));

vi.mock("./App", () => ({
  default: () => null,
}));

vi.mock("./platform", () => ({
  default: {
    registerServiceWorker: registerServiceWorkerMock,
  },
}));

vi.mock("./i18n/IntlWrapper", () => ({
  IntlWrapper: ({ children }: { children: unknown }) => children,
}));

vi.mock("react-router-dom", () => ({
  BrowserRouter: ({ children }: { children: unknown }) => children,
}));

const setRootContainer = (container: unknown) => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    writable: true,
    value: {
      getElementById: vi.fn().mockReturnValue(container),
    },
  });
};

describe("app bootstrap", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    createRootMock.mockReturnValue({ render: renderMock });
  });

  afterEach(() => {
    setRootContainer(null);
  });

  it("renders app when root container exists", async () => {
    const rootElement = { id: "root" };
    setRootContainer(rootElement);

    await import("./index");

    expect(createRootMock).toHaveBeenCalledWith(rootElement);
    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(registerServiceWorkerMock).toHaveBeenCalledTimes(1);
  });

  it("still registers service worker when root container is missing", async () => {
    setRootContainer(null);

    await import("./index");

    expect(createRootMock).not.toHaveBeenCalled();
    expect(registerServiceWorkerMock).toHaveBeenCalledTimes(1);
  });
});

