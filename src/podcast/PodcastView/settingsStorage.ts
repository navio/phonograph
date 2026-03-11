/**
 * Per-podcast playback settings persisted in localStorage.
 *
 * Each podcast (keyed by its feed URL) can have:
 *  - skipIntro:    minutes to skip at the start (0-5)
 *  - skipOutro:    minutes before the end to stop  (0-5)
 *  - defaultSpeed: playback rate (1.0 … 2.0)
 */

export interface PodcastSettings {
  skipIntro: number;
  skipOutro: number;
  defaultSpeed: number;
}

const STORAGE_KEY = "podcastSettings";

export const defaultSettings: PodcastSettings = {
  skipIntro: 0,
  skipOutro: 0,
  defaultSpeed: 1.0,
};

// ---------------------------------------------------------------------------
// Read / write helpers
// ---------------------------------------------------------------------------

function getAllSettings(): Record<string, PodcastSettings> {
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getPodcastSettings(podcastUrl: string): PodcastSettings {
  if (!podcastUrl) return { ...defaultSettings };
  const all = getAllSettings();
  return { ...defaultSettings, ...(all[podcastUrl] || {}) };
}

export function savePodcastSettings(
  podcastUrl: string,
  patch: Partial<PodcastSettings>
): PodcastSettings {
  const all = getAllSettings();
  const current = all[podcastUrl] || { ...defaultSettings };
  const updated = { ...current, ...patch };
  all[podcastUrl] = updated;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // storage full or unavailable – silently ignore
  }
  return updated;
}

// ---------------------------------------------------------------------------
// Convenience: look up settings for whatever podcast is currently playing.
// Reads the global app state from localStorage to obtain `audioOrigin`.
// ---------------------------------------------------------------------------

export function getSettingsForCurrentPodcast(): PodcastSettings | null {
  try {
    const stateRaw = localStorage.getItem("state");
    if (!stateRaw) return null;
    const state = JSON.parse(stateRaw);
    const audioOrigin: string | undefined = state?.audioOrigin;
    if (!audioOrigin) return null;
    return getPodcastSettings(audioOrigin);
  } catch {
    return null;
  }
}
