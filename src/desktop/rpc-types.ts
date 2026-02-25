import type { RPCSchema } from "electrobun";

export type PhonographRPC = {
  bun: RPCSchema<{
    requests: {
      fetchRSS: { params: { url: string }; response: string };
      resolveURL: { params: { url: string }; response: { url: string } };
      searchApple: { params: { term: string }; response: unknown };
      fetchListenNotes: {
        params: { path: string; params: Record<string, string> };
        response: unknown;
      };
    };
    messages: {};
  }>;
  webview: RPCSchema<{
    requests: {};
    messages: {};
  }>;
};
