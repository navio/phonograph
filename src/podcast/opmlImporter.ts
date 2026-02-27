import { OpmlFeed } from "./opml";

export interface ImportFailure {
  url: string;
  error: string;
}

export interface ImportSummary {
  successes: string[];
  failures: ImportFailure[];
}

export const isValidHttpUrl = (input: string) => {
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_err) {
    return false;
  }
};

export const importFeeds = async (
  engine: any,
  feeds: OpmlFeed[],
  opts?: {
    timeoutMs?: number;
    save?: boolean;
    onProgress?: (done: number, total: number) => void;
  }
): Promise<ImportSummary> => {
  const timeoutMs = opts?.timeoutMs ?? 15000;
  const total = feeds.length;
  const failures: ImportFailure[] = [];
  const successes: string[] = [];

  let done = 0;

  for (const feed of feeds) {
    const url = (feed?.url || "").toString();

    if (!url || !isValidHttpUrl(url)) {
      failures.push({ url, error: "Malformed URL" });
      done += 1;
      opts?.onProgress?.(done, total);
      continue;
    }

    // Start the plugin call and a timeout race. We attach a catch to the original
    // promise to avoid unhandled rejections later if the race times out.
    let originalPromise: Promise<any> | null = null;
    try {
      originalPromise = (engine as any).getPodcast(url, { save: !!opts?.save });
    } catch (err: any) {
      failures.push({ url, error: err?.message || String(err) });
      done += 1;
      opts?.onProgress?.(done, total);
      continue;
    }

    const timeoutPromise = new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error("Timeout"));
      }, timeoutMs);
    });

    try {
      await Promise.race([originalPromise, timeoutPromise]);
      successes.push(url);
    } catch (err: any) {
      failures.push({ url, error: err?.message || String(err) });
    } finally {
      done += 1;
      opts?.onProgress?.(done, total);
      // swallow any later rejection from the original promise
      try {
        originalPromise?.catch?.(() => {
          /* noop */
        });
      } catch (_e) {
        // ignore
      }
    }
  }

  return { successes, failures };
};
