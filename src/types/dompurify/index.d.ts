declare module "dompurify" {
  const createDOMPurify: (window?: Window) => any;
  export default createDOMPurify;
  export function sanitize(dirty: string, options?: unknown): string;
}
