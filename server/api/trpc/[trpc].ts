import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../routers";
import { createFetchContext } from "../../_core/fetchContext";

export default async function handler(req: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createFetchContext,
    onError({ error, path }) {
      if (process.env.NODE_ENV === "development") {
        console.error(`[tRPC Error] ${path ?? "unknown"}:`, error.message);
      }
    },
  });
}
