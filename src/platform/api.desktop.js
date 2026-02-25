export const desktopPlatform = (view) => ({
  fetchRSS: (url) => view.rpc.request.fetchRSS({ url }),
  resolveURL: (url) => view.rpc.request.resolveURL({ url }),
  searchApple: (term) => view.rpc.request.searchApple({ term }),
  fetchListenNotes: (path, params = {}) => {
    console.info("[desktopPlatform] fetchListenNotes", { path, params });
    return view.rpc.request.fetchListenNotes({ path, params });
  },
});
