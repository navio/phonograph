// Ambient declarations for third-party libraries without bundled types

declare module "podcastsuite" {
  interface Database {
    get(key: string): Promise<Record<string, unknown> | undefined>;
    set(key: string, value: unknown): Promise<void>;
  }

  interface PodcastSuite {
    createDatabase(name: string, store: string): Database;
    [key: string]: unknown;
  }

  const PS: PodcastSuite;
  export default PS;
}

declare module "audioqueue" {
  const audioqueue: unknown;
  export default audioqueue;
}

declare module "colorthief" {
  export default class ColorThief {
    getColor(img: HTMLImageElement, quality?: number): [number, number, number];
    getPalette(
      img: HTMLImageElement,
      colorCount?: number,
      quality?: number
    ): [number, number, number][];
  }
}

declare module "smallfetch" {
  function smallfetch(url: string, options?: RequestInit): Promise<Response>;
  export default smallfetch;
}

declare module "randomcolor" {
  interface Options {
    hue?: string | number;
    luminosity?: "bright" | "light" | "dark" | "random";
    count?: number;
    seed?: number | string;
    format?: string;
    alpha?: number;
  }

  function randomColor(options?: Options): string;
  export default randomColor;
}

declare module "dompurify" {
  const createDOMPurify: (window?: Window) => any;
  export default createDOMPurify;
  export function sanitize(dirty: string, options?: unknown): string;
}
