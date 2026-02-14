// Global augmentations and Vite module declarations

interface Window {
  player: HTMLAudioElement;
}

declare module "*?worker" {
  const workerConstructor: new () => Worker;
  export default workerConstructor;
}

declare module "*.svg" {
  const src: string;
  export default src;
}
