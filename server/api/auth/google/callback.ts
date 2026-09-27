import type { IncomingMessage, ServerResponse } from "node:http";
import { SignJWT } from "jose";
import * as db from "../../../db";

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const COOKIE_NAME = "app_session_id";

/**
 * Google OAuth callback handler — Vercel Node.js runtime.
 *
 * Exchanges the authorization code for tokens, verifies admin access,
 * upserts the user, creates a JWT session cookie, and redirects to /admin.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const appUrl = getAppUrl(req);

  // Parse query string from the URL
  const urlStr = req.url ?? "";
  const queryString = urlStr.includes("?") ? urlStr.split("?")[1] : "";
  const params = new URLSearchParams(queryString);

  const code = params.get("code");
  const error = params.get("error");

  if (error) {
    console.error("[Google OAuth Callback] Error from Google:", error);
    res.writeHead(302, { Location: `${appUrl}/?auth=error` });
    res.end();
    return;
  }

  if (!code) {
    res.statusCode = 400;
    res.end("Missing OAuth code");
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!clientId || !clientSecret || !jwtSecret || !adminEmail) {
    console.error("[Google OAuth Callback] Missing required env vars");
    res.statusCode = 500;
    res.end("Server configuration error");
    return;
  }

  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    // Step 1: Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text().catch(() => "");
      console.error("[Google OAuth Callback] Token exchange failed:", err);
      res.statusCode = 500;
      res.end("Token exchange failed");
      return;
    }

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      id_token?: string;
    };

    if (!tokenData.access_token) {
      res.statusCode = 500;
      res.end("No access token received");
      return;
    }

    // Step 2: Get user info from Google
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!userInfoRes.ok) {
      res.statusCode = 500;
      res.end("Failed to fetch user info from Google");
      return;
    }

    const userInfo = (await userInfoRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    // Step 3: Check admin access (case-insensitive)
    if (!userInfo.email || userInfo.email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
      console.warn(
        `[Google OAuth Callback] Unauthorized login attempt: ${userInfo.email} (expected: ${adminEmail})`
      );
      res.writeHead(302, { Location: `${appUrl}/?auth=unauthorized` });
      res.end();
      return;
    }

    const openId = `google_${userInfo.sub}`;
    const name = userInfo.name ?? userInfo.email ?? "Admin";

    // Step 4: Upsert user in Neon DB
    await db.upsertUser({
      openId,
      name,
      email: userInfo.email,
      loginMethod: "google",
      lastSignedIn: new Date(),
      role: "admin",
    });

    // Step 5: Create JWT session token
    const secretKey = new TextEncoder().encode(jwtSecret);
    const expirationSeconds = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);

    const sessionToken = await new SignJWT({ openId, appId: "", name })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);

    // Step 6: Set session cookie and redirect to admin
    const isLocalhost = appUrl.includes("localhost");
    const cookieFlags = isLocalhost
      ? `Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_MS / 1000}`
      : `Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_MS / 1000}; Secure`;

    res.writeHead(302, {
      Location: `${appUrl}/admin`,
      "Set-Cookie": `${COOKIE_NAME}=${sessionToken}; ${cookieFlags}`,
    });
    res.end();
  } catch (err) {
    console.error("[Google OAuth Callback] Unexpected error:", err);
    res.statusCode = 500;
    res.end("OAuth callback failed");
  }
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
