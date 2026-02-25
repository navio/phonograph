export const webPlatform = {
  fetchRSS: (url) =>
    fetch(`/rss-full/?term=${encodeURIComponent(url)}`).then((res) => res.text()),
  resolveURL: (url) =>
    fetch(`/lhead/?term=${encodeURIComponent(url)}`).then((res) => res.json()),
  searchApple: (term) =>
    fetch(`/search/?term=${encodeURIComponent(term)}`).then((res) => res.json()),
  fetchListenNotes: async (path, params = {}) => {
    const search = new URLSearchParams(params);
    const res = await fetch(`/ln/${path}?${search}`);
    if (!res.ok) {
      throw new Error(`Listen Notes request failed: ${res.status}`);
    }
    return res.json();
  },
};
