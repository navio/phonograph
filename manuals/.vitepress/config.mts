import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Phonograph Manual",
  description: "User documentation for discovery, playback, library, and settings.",
  lang: "en-US",
  base: "/docs/",
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Getting Started", link: "/getting-started" },
      { text: "Discovery", link: "/discovery-and-library" },
      { text: "Player", link: "/player-controls" },
      { text: "Troubleshooting", link: "/troubleshooting" }
    ],
    sidebar: [
      {
        text: "Phonograph Manual",
        items: [
          { text: "Overview", link: "/" },
          { text: "Getting Started", link: "/getting-started" },
          { text: "Discovery & Library", link: "/discovery-and-library" },
          { text: "Playback Controls", link: "/player-controls" },
          { text: "Troubleshooting", link: "/troubleshooting" }
        ]
      }
    ],
    search: {
      provider: "local"
    }
  }
});
