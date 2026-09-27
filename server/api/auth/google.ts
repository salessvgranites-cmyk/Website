import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Google OAuth initiation handler — Vercel Node.js runtime.
 *
 * Redirects the user to Google's OAuth consent screen.
 * Derives the callback URL dynamically from request headers or
 * the VITE_APP_URL env var so no domain is hardcoded.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = getAppUrl(req);

  if (!clientId) {
    res.statusCode = 500;
    res.end("Google OAuth Client ID not configured");
    return;
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  res.writeHead(302, {
    Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  });
  res.end();
}

/**
 * Derive the application base URL from request headers or env vars.
 * Never hardcodes a domain — works on any Vercel deployment or custom domain.
 */
function getAppUrl(req: IncomingMessage): string {
  // 1. Prefer explicit env var (e.g. if set in Vercel project settings)
  if (process.env.VITE_APP_URL) {
    return process.env.VITE_APP_URL.replace(/\/+$/, "");
  }

  // 2. Derive dynamically from request headers or Vercel system vars
  const rawHost =
    (req.headers["x-forwarded-host"] as string) ||
    req.headers.host ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (rawHost) {
    // If x-forwarded-host contains comma-separated proxy hops, use the client-facing first host
    const host = rawHost.split(",")[0].trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const rawProto = (req.headers["x-forwarded-proto"] as string) || "";
    const proto =
      rawProto.split(",")[0].trim() ||
      (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}
