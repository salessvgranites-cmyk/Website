import type { IncomingMessage, ServerResponse } from "node:http";
import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../routers";
import { createContext } from "../../_core/context";

/**
 * Vercel Node.js runtime handler.
 *
 * Vercel passes a Node.js IncomingMessage + ServerResponse — NOT a Web API
 * Request. The tRPC `nodeHTTPRequestHandler` is designed exactly for this:
 * it converts IncomingMessage → Web Request internally and handles the
 * response writing back to ServerResponse automatically.
 *
 * The `createContext` from context.ts works here because it expects
 * Express-like req/res which is compatible with Node.js IncomingMessage.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  // Extract the tRPC procedure path from the URL.
  // URL is like "/api/trpc/site.content,site.products?batch=1&..."
  // The path segment after "/api/trpc/" is what tRPC needs.
  const url = req.url ?? "";
  const pathMatch = url.match(/\/api\/trpc\/([^?#]*)/);
  const rawPath = pathMatch ? pathMatch[1] : "";
  const path = decodeURIComponent(rawPath).replace(/^\/+|\/+$/g, "");

  await nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext,
    onError({ error, path: errorPath }) {
      console.error(
        `[tRPC Error] ${errorPath ?? "unknown"}:`,
        error.message
      );
    },
  });
}
