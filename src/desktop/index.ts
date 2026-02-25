import {
  ApplicationMenu,
  BrowserView,
  BrowserWindow,
  Updater,
} from "electrobun/bun";
import type { PhonographRPC } from "./rpc-types";

const LISTEN_NOTES_KEY =
  process.env.LISTEN_NOTES_API_KEY ||
  process.env.LISTENNOTES ||
  process.env.listennotes ||
  "ebbd0481aa1b4acc8949a9ffeedf4d7b"; // fallback dev key (same as vite proxy)

const rpc = BrowserView.defineRPC<PhonographRPC>({
  maxRequestTime: 15000,
  handlers: {
    requests: {
      fetchRSS: async ({ url }) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
          const res = await fetch(url, {
            headers: {
              "User-Agent": "podcastsuite",
              Accept: "application/rss+xml",
            },
            signal: controller.signal,
          });
          return res.text();
        } catch (error) {
          console.error("fetchRSS failed", { url, error: String(error) });
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      },
      resolveURL: async ({ url }) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
          const res = await fetch(url, {
            method: "HEAD",
            redirect: "follow",
            headers: {
              "User-Agent": "podcastsuite",
            },
            signal: controller.signal,
          });
          return { url: res.url };
        } catch (error) {
          console.error("resolveURL failed", { url, error: String(error) });
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      },
      searchApple: async ({ term }) => {
        const url = new URL("https://itunes.apple.com/search");
        url.searchParams.set("term", term);
        url.searchParams.set("media", "podcast");
        url.searchParams.set("entity", "podcast");
        url.searchParams.set("limit", "50");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        try {
          const res = await fetch(url.toString(), {
            headers: {
              "User-Agent": "podcastsuite",
              Accept: "application/json",
            },
            signal: controller.signal,
          });
          return res.json();
        } catch (error) {
          console.error("searchApple failed", { term, error: String(error) });
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      },
      fetchListenNotes: async ({ path, params }) => {
        if (!LISTEN_NOTES_KEY) {
          console.error("Listen Notes key missing in bun process");
          throw new Error("Missing LISTEN_NOTES_API_KEY");
        }
        const url = new URL(path, "https://listen-api.listennotes.com/api/v2/");
        for (const [key, value] of Object.entries(params || {})) {
          url.searchParams.set(key, value);
        }
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        console.info("Listen Notes request", url.toString());
        try {
          const res = await fetch(url.toString(), {
            headers: {
              "User-Agent": "podcastsuite",
              Accept: "application/json",
              "X-ListenAPI-Key": LISTEN_NOTES_KEY,
              "X-From": "Phonograph",
            },
            signal: controller.signal,
          });
          if (!res.ok) {
            const body = await res.text().catch(() => "");
            console.error("Listen Notes request failed", {
              status: res.status,
              url: url.toString(),
              body,
            });
            throw new Error(`Listen Notes request failed: ${res.status}`);
          }
          return res.json();
        } catch (error) {
          console.error("Listen Notes request error", {
            url: url.toString(),
            error: String(error),
          });
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      },
    },
    messages: {},
  },
});

const win = new BrowserWindow({
  title: "Phonograph",
  html: "<html><body style=\"margin:0; font-family: Arial, sans-serif; padding: 24px; background:#fffbf2; color:#222;\"><h1 style=\"margin:0 0 8px; font-size:20px;\">Loading Phonograph...</h1><div>This is a temporary loader to confirm the webview renders.</div></body></html>",
  titleBarStyle: "hiddenInset",
  rpc,
  frame: {
    width: 1200,
    height: 800,
    x: 80,
    y: 80,
  },
});

setTimeout(() => {
  try {
    win.webview.loadURL("views://mainview/index.html");
  } catch (error) {
    console.warn("Failed to load main view:", error);
  }
}, 500);

// Menu roles supported by this Electrobun version:
// quit, hide, hideOthers, showAll, undo, redo, cut, copy, paste,
// pasteAndMatchStyle, delete, selectAll, startSpeaking, stopSpeaking,
// enterFullScreen, exitFullScreen, toggleFullScreen, minimize, zoom,
// bringAllToFront, close, cycleThroughWindows, showHelp
setTimeout(() => {
  ApplicationMenu.setApplicationMenu([
    {
      label: "Phonograph",
      submenu: [
        { role: "hide" },
        { role: "hideOthers" },
      { role: "showAll" },
      { type: "separator" },
      { role: "quit" },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "pasteAndMatchStyle" },
      { role: "delete" },
      { role: "selectAll" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "toggleFullScreen" },
    ],
  },
  {
    label: "Window",
    submenu: [
      { role: "minimize" },
      { role: "zoom" },
      { role: "close" },
      { type: "separator" },
      { role: "bringAllToFront" },
      { role: "cycleThroughWindows" },
    ],
  },
  {
    label: "Help",
    submenu: [
      { role: "showHelp" },
    ],
  },
  ]);

  // Check for updates on startup (non-blocking, safe to fail in dev)
  Updater.checkForUpdate().catch((error: unknown) => {
    console.warn("Updater check failed:", error);
  });
}, 750);
