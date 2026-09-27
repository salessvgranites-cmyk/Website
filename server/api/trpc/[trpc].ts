import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../routers";
import { createFetchContext } from "../../_core/fetchContext";

function getRequestUrl(req: Request): string {
  if (req.url.startsWith("http://") || req.url.startsWith("https://")) {
    return req.url;
  }
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    process.env.VITE_APP_URL?.replace(/^https?:\/\//, "") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "localhost:3000";

  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");

  return `${proto}://${host}${req.url}`;
}

export default async function handler(req: Request): Promise<Response> {
  const fullUrl = getRequestUrl(req);
  const request = req.url.startsWith("http") ? req : new Request(fullUrl, req);

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: createFetchContext,
    onError({ error, path }) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[tRPC Error] ${path ?? "unknown"}:`, error.message);
      }
    },
  });
}
