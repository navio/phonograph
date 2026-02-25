import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { NodeModulesPolyfillPlugin } from "@esbuild-plugins/node-modules-polyfill";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    nodePolyfills({
      include: ["stream", "timers", "events", "buffer", "process", "util", "string_decoder"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  esbuild: {
    loader: "tsx",
    include: [/src\/.*\.js$/, /node_modules\/electrobun\/.*\.ts$/],
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx",
        ".ts": "ts",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  server: {
    port: 1234,
    proxy: {
      "/api": {
        target: "http://localhost:9999",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/.netlify/functions/"),
      },
      "/rss-full": {
        target: "http://localhost:9999",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rss-full/, "/.netlify/functions/findCast/"),
      },
      "/rss-audio": {
        target: "http://phonograph.app",
        changeOrigin: true,
      },
      "/ln": {
        target: "https://listen-api.listennotes.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ln/, "/api/v2/"),
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("X-ListenAPI-Key", process.env.listennotes || "ebbd0481aa1b4acc8949a9ffeedf4d7b");
            proxyReq.setHeader("X-From", "Gramophone-DEV");
          });
        },
      },
      "/search": {
        target: "https://itunes.apple.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/search/, "/search"),
      },
    },
  },
  base: mode === "desktop" ? "./" : "/",
  build: {
    outDir: mode === "desktop" ? "dist-desktop" : "dist",
    assetsDir: "assets",
    sourcemap: mode === "desktop",
    rollupOptions: {
      // Force using Rollup instead of Rolldown for JSX compatibility
    },
  },
  resolve: {
    alias: {
      public: "/public/",
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
    "process.env.PLATFORM": JSON.stringify(mode === "desktop" ? "desktop" : "web"),
    global: "globalThis",
  },
}));
