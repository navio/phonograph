interface PodcastFetcher {
  getPodcast?: (url: string, options?: { fresh?: number }) => Promise<unknown>;
}

export const prefetchSavedPodcasts = async (
  engine: PodcastFetcher | null | undefined,
  domains: string[],
  online = typeof navigator === "undefined" ? true : navigator.onLine
): Promise<void> => {
  if (!engine?.getPodcast || !domains.length) {
    return;
  }

  const uniqueDomains = Array.from(new Set(domains.filter(Boolean)));
  if (!uniqueDomains.length) {
    return;
  }

  const fresh = online ? undefined : Infinity;

  await Promise.allSettled(uniqueDomains.map((domain) => engine.getPodcast?.(domain, { fresh })));
};
