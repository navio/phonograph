export interface OpmlFeed {
  url: string;
  title?: string;
}

export interface OpmlParseResult {
  feeds: OpmlFeed[];
}

const normalizeUrl = (originalUrl: string) => {
  if (!originalUrl) return "";
  let url = originalUrl.trim();
  url = url.indexOf("http:") > -1 ? url.replace("http:", "https:") : url;
  url = url.search("http") < 0 ? "https://" + url : url;
  url = url.indexOf("feeds.feedburner") > -1 && url.indexOf("?format=xml") === -1 ? url + "?format=xml" : url;
  return url;
};

const getAttrCaseInsensitive = (el: Element, name: string) => {
  return el.getAttribute(name) || el.getAttribute(name.toLowerCase()) || el.getAttribute(name.toUpperCase());
};

export const parseOpml = (xmlText: string): OpmlParseResult => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  // Some parsers include <parsererror> for invalid XML
  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    throw new Error("Invalid OPML/XML file");
  }

  const outlines = Array.from(doc.getElementsByTagName("outline"));

  const feeds: OpmlFeed[] = [];
  const seen = new Set<string>();

  for (const outline of outlines) {
    const xmlUrl = getAttrCaseInsensitive(outline, "xmlUrl") || getAttrCaseInsensitive(outline, "url");
    if (!xmlUrl) continue;

    const url = normalizeUrl(xmlUrl);
    if (!url) continue;

    if (seen.has(url)) continue;
    seen.add(url);

    const title = getAttrCaseInsensitive(outline, "title") || getAttrCaseInsensitive(outline, "text") || undefined;

    feeds.push({ url, title });
  }

  return { feeds };
};

const xmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");

export const buildOpml = (feeds: OpmlFeed[], opts?: { title?: string }) => {
  const title = opts?.title || "Phonograph Subscriptions";

  const now = new Date().toISOString();
  const outlines = feeds
    .filter((f) => !!f.url)
    .map((f) => {
      const t = f.title ? xmlEscape(f.title) : xmlEscape(f.url);
      const u = xmlEscape(f.url);
      return `    <outline type="rss" text="${t}" title="${t}" xmlUrl="${u}" />`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<opml version="1.0">\n  <head>\n    <title>${xmlEscape(title)}</title>\n    <dateCreated>${now}</dateCreated>\n  </head>\n  <body>\n${outlines ? outlines + "\n" : ""}  </body>\n</opml>\n`;
};
