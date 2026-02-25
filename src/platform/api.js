let platformImpl = null;

export const initPlatform = (impl) => {
  platformImpl = impl;
};

const ensurePlatform = () => {
  if (!platformImpl) {
    throw new Error("Platform adapter not initialized");
  }
};

export const fetchRSS = (url) => {
  ensurePlatform();
  return platformImpl.fetchRSS(url);
};

export const resolveURL = (url) => {
  ensurePlatform();
  return platformImpl.resolveURL(url);
};

export const searchApple = (term) => {
  ensurePlatform();
  return platformImpl.searchApple(term);
};

export const fetchListenNotes = (path, params = {}) => {
  ensurePlatform();
  return platformImpl.fetchListenNotes(path, params);
};
