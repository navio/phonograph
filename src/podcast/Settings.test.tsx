import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  componentProps: {} as Record<string, any[]>,
  initializeLibraryMock: vi.fn(async () => {}),
  hasNativeOpmlDialogsMock: vi.fn(() => true),
  importOpmlFromNativeDialogMock: vi.fn(async () => ({ text: "<opml />", fileName: "subs.opml" })),
  exportOpmlWithNativeDialogMock: vi.fn(async () => "saved"),
  buildOpmlMock: vi.fn(() => "<opml />"),
  parseOpmlMock: vi.fn(() => ({ feeds: [{ url: "https://new.example/rss.xml" }] })),
  importFeedsMock: vi.fn(async () => ({ successes: ["https://new.example/rss.xml"], failures: [] })),
  deletePodcastMock: vi.fn(async () => {}),
}));

const resetTrackedProps = () => {
  Object.keys(hoisted.componentProps).forEach((key) => {
    hoisted.componentProps[key] = [];
  });
};

const trackProps = (name: string, props: any) => {
  if (!hoisted.componentProps[name]) {
    hoisted.componentProps[name] = [];
  }
  hoisted.componentProps[name].push(props);
};

function makeTrackedComponent(name: string) {
  return (props: any) => {
    trackProps(name, props);
    return React.createElement("div", { "data-component": name }, props.children);
  };
}

const formatMessage = (template = "", values?: Record<string, unknown>) => {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_m, key) => String(values[key] ?? ""));
};

vi.mock("../App", async () => {
  const ReactModule = await import("react");
  return {
    AppContext: ReactModule.createContext(null),
  };
});

vi.mock("../engine", () => ({
  initializeLibrary: hoisted.initializeLibraryMock,
}));

vi.mock("podcastsuite", () => ({
  default: {
    db: {
      del: hoisted.deletePodcastMock,
    },
  },
}));

vi.mock("../platform/opmlDialogs", () => ({
  hasNativeOpmlDialogs: hoisted.hasNativeOpmlDialogsMock,
  importOpmlFromNativeDialog: hoisted.importOpmlFromNativeDialogMock,
  exportOpmlWithNativeDialog: hoisted.exportOpmlWithNativeDialogMock,
}));

vi.mock("./opml", () => ({
  buildOpml: hoisted.buildOpmlMock,
  parseOpml: hoisted.parseOpmlMock,
}));

vi.mock("./opmlImporter", () => ({
  importFeeds: hoisted.importFeedsMock,
}));

vi.mock("react-intl", () => ({
  FormattedMessage: ({ defaultMessage, values }: { defaultMessage?: string; values?: Record<string, unknown> }) =>
    React.createElement("span", null, formatMessage(defaultMessage, values)),
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage?: string }, values?: Record<string, unknown>) =>
      formatMessage(defaultMessage, values),
    formatDate: () => "2026-03-12",
  }),
}));

vi.mock("react/jsx-runtime", async () => {
  const actual = await vi.importActual<typeof import("react/jsx-runtime")>("react/jsx-runtime");

  const trackElement = (type: any, props: any) => {
    if (type === "input") {
      trackProps("input", props);
    }
  };

  return {
    ...actual,
    jsx: (type: any, props: any, key: any) => {
      trackElement(type, props);
      return actual.jsx(type, props, key);
    },
    jsxs: (type: any, props: any, key: any) => {
      trackElement(type, props);
      return actual.jsxs(type, props, key);
    },
  };
});

vi.mock("react/jsx-dev-runtime", async () => {
  const actual = await vi.importActual<typeof import("react/jsx-dev-runtime")>("react/jsx-dev-runtime");

  const trackElement = (type: any, props: any) => {
    if (type === "input") {
      trackProps("input", props);
    }
  };

  return {
    ...actual,
    jsxDEV: (type: any, props: any, key: any, isStaticChildren: any, source: any, self: any) => {
      trackElement(type, props);
      return actual.jsxDEV(type, props, key, isStaticChildren, source, self);
    },
  };
});

vi.mock("@mui/material/AppBar", () => ({ default: makeTrackedComponent("AppBar") }));
vi.mock("@mui/material/Toolbar", () => ({ default: makeTrackedComponent("Toolbar") }));
vi.mock("@mui/material/List", () => ({ default: makeTrackedComponent("List") }));
vi.mock("@mui/material/ListItem", () => ({ default: makeTrackedComponent("ListItem") }));
vi.mock("@mui/material/ListItemText", () => ({ default: makeTrackedComponent("ListItemText") }));
vi.mock("@mui/material/Divider", () => ({ default: makeTrackedComponent("Divider") }));
vi.mock("@mui/material/IconButton", () => ({ default: makeTrackedComponent("IconButton") }));
vi.mock("@mui/material/Card", () => ({ default: makeTrackedComponent("Card") }));
vi.mock("@mui/material/CardContent", () => ({ default: makeTrackedComponent("CardContent") }));
vi.mock("@mui/material/Typography", () => ({ default: makeTrackedComponent("Typography") }));
vi.mock("@mui/material/Accordion", () => ({ default: makeTrackedComponent("Accordion") }));
vi.mock("@mui/material/AccordionSummary", () => ({ default: makeTrackedComponent("AccordionSummary") }));
vi.mock("@mui/material/AccordionDetails", () => ({ default: makeTrackedComponent("AccordionDetails") }));
vi.mock("@mui/material/Snackbar", () => ({ default: makeTrackedComponent("Snackbar") }));
vi.mock("@mui/material/Alert", () => ({ default: makeTrackedComponent("Alert") }));
vi.mock("@mui/material/LinearProgress", () => ({ default: makeTrackedComponent("LinearProgress") }));
vi.mock("@mui/material/ToggleButton", () => ({ default: makeTrackedComponent("ToggleButton") }));
vi.mock("@mui/material/ToggleButtonGroup", () => ({ default: makeTrackedComponent("ToggleButtonGroup") }));
vi.mock("@mui/material/Switch", () => ({ default: makeTrackedComponent("Switch") }));
vi.mock("@mui/material/FormControlLabel", () => ({ default: makeTrackedComponent("FormControlLabel") }));
vi.mock("@mui/material/Select", () => ({ default: makeTrackedComponent("Select") }));
vi.mock("@mui/material/MenuItem", () => ({ default: makeTrackedComponent("MenuItem") }));
vi.mock("@mui/material/InputLabel", () => ({ default: makeTrackedComponent("InputLabel") }));
vi.mock("@mui/material/FormControl", () => ({ default: makeTrackedComponent("FormControl") }));
vi.mock("@mui/material", () => ({ Button: makeTrackedComponent("Button") }));

vi.mock("@mui/icons-material/Delete", () => ({ default: () => null }));
vi.mock("@mui/icons-material/ExpandMore", () => ({ default: () => null }));
vi.mock("@mui/icons-material/WbSunny", () => ({ default: () => null }));
vi.mock("@mui/icons-material/NightsStay", () => ({ default: () => null }));
vi.mock("@mui/icons-material/UploadFile", () => ({ default: () => null }));
vi.mock("@mui/icons-material/Download", () => ({ default: () => null }));

import { AppContext } from "../App";
import Settings from "./Settings";

const renderSettings = (dispatch: any, stateOverrides: Record<string, unknown> = {}) => {
  resetTrackedProps();

  const state: any = {
    podcasts: [
      {
        domain: "https://example.com/feed.xml",
        url: "https://example.com/feed.xml",
        title: "Example Podcast",
        created: Date.now(),
      },
    ],
    locale: "en",
    theme: "light",
    themeName: "nord",
    themeIsOld: false,
    podcastView: true,
    podcastViewEnabled: true,
    ...stateOverrides,
  };

  return renderToStaticMarkup(
    <AppContext.Provider value={{ state, dispatch, engine: {}, debug: true, worker: {} as any, player: null, playerRef: { current: null } }}>
      <Settings />
    </AppContext.Provider>
  );
};

describe("Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.hasNativeOpmlDialogsMock.mockReturnValue(true);
    hoisted.importOpmlFromNativeDialogMock.mockResolvedValue({ text: "<opml />", fileName: "subs.opml" });
    hoisted.exportOpmlWithNativeDialogMock.mockResolvedValue("saved");
    hoisted.parseOpmlMock.mockReturnValue({ feeds: [{ url: "https://new.example/rss.xml" }] });
    (hoisted.importFeedsMock as any).mockImplementation(async (_engine: any, _feeds: any, opts: any) => {
      opts?.onProgress?.(1, 1);
      return { successes: ["https://new.example/rss.xml"], failures: [] };
    });

    Object.defineProperty(globalThis, "URL", {
      configurable: true,
      writable: true,
      value: {
        createObjectURL: vi.fn(() => "blob:mock"),
        revokeObjectURL: vi.fn(),
      },
    });

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      writable: true,
      value: {
        createElement: vi.fn(() => ({
          click: vi.fn(),
          remove: vi.fn(),
          href: "",
          download: "",
        })),
        body: {
          appendChild: vi.fn(),
        },
      },
    });
  });

  it("executes major settings handlers", async () => {
    const dispatch = vi.fn(async () => {});
    const html = renderSettings(dispatch);

    expect(html).toContain("Phonograph");

    const themeGroup = hoisted.componentProps.ToggleButtonGroup[0];
    const themeNameGroup = hoisted.componentProps.ToggleButtonGroup[1];
    const select = hoisted.componentProps.Select[0];
    const buttons = hoisted.componentProps.Button;
    const podcastViewToggle = hoisted.componentProps.FormControlLabel[0].control;
    const listItem = hoisted.componentProps.ListItem[0];
    const snackbar = hoisted.componentProps.Snackbar[0];
    const alert = hoisted.componentProps.Alert[0];
    const hiddenInput = hoisted.componentProps.input[0];

    await themeGroup.onChange({}, "dark");
    await themeGroup.onChange({}, null);
    await themeNameGroup.onChange({}, "dracula");
    await themeNameGroup.onChange({}, null);
    await select.onChange({ target: { value: "es" } });

    await buttons[0].onClick();
    await buttons[1].onClick();
    await buttons[2].onClick();
    await buttons[3].onClick();
    await podcastViewToggle.props.onChange({ target: { checked: false } });
    await listItem.secondaryAction.props.onClick();
    await hiddenInput.onChange({ target: { files: [], value: "x" } });
    await hiddenInput.onChange({
      target: {
        files: [{ text: async () => "<opml />" }],
        value: "x",
      },
    });

    snackbar.onClose();
    alert.onClose();

    expect(dispatch).toHaveBeenCalledWith({ type: "setDark", payload: "dark" });
    expect(dispatch).toHaveBeenCalledWith({ type: "setThemeName", payload: "dracula" });
    expect(dispatch).toHaveBeenCalledWith({ type: "setLocale", payload: "es" });
    expect(hoisted.exportOpmlWithNativeDialogMock).toHaveBeenCalled();
    expect(hoisted.importOpmlFromNativeDialogMock).toHaveBeenCalled();
    expect(hoisted.initializeLibraryMock).toHaveBeenCalled();
    expect(hoisted.deletePodcastMock).toHaveBeenCalled();
  });

  it("covers export and import edge paths", async () => {
    const dispatch = vi.fn(async () => {});
    renderSettings(dispatch);

    const exportButton = hoisted.componentProps.Button[0];
    const importButton = hoisted.componentProps.Button[1];

    hoisted.exportOpmlWithNativeDialogMock.mockResolvedValueOnce("cancelled");
    await exportButton.onClick();

    hoisted.exportOpmlWithNativeDialogMock.mockResolvedValueOnce("unsupported");
    await exportButton.onClick();

    hoisted.exportOpmlWithNativeDialogMock.mockRejectedValueOnce(new Error("native export failed"));
    await exportButton.onClick();

    hoisted.parseOpmlMock.mockReturnValueOnce({ feeds: [] });
    await importButton.onClick();

    hoisted.importOpmlFromNativeDialogMock.mockResolvedValueOnce(null);
    await importButton.onClick();

    hoisted.hasNativeOpmlDialogsMock.mockReturnValueOnce(false);
    await importButton.onClick();

    hoisted.parseOpmlMock.mockReturnValueOnce({ feeds: [{ url: "https://new.example/rss.xml" }] });
    hoisted.importFeedsMock.mockResolvedValueOnce({ successes: [], failures: [{ url: "https://new.example/rss.xml", error: "Timeout" }] });
    await importButton.onClick();

    hoisted.parseOpmlMock.mockImplementationOnce(() => {
      throw new Error("Invalid OPML/XML file");
    });
    await importButton.onClick();

    hoisted.importOpmlFromNativeDialogMock.mockRejectedValueOnce(new Error("native import failed"));
    await importButton.onClick();

    renderSettings(dispatch, {
      locale: null,
      podcasts: [],
      podcastViewEnabled: false,
    });

    expect(hoisted.exportOpmlWithNativeDialogMock).toHaveBeenCalled();
    expect(hoisted.importOpmlFromNativeDialogMock).toHaveBeenCalled();
  });
});
