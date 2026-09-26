import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { createFetchContext } from "../../server/_core/fetchContext";

// Runtime and duration are configured in vercel.json (nodejs20.x)
// No dotenv needed — Vercel injects env vars automatically at runtime

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
