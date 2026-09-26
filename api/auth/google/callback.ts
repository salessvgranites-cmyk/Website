import { SignJWT } from "jose";
import * as db from "../../../server/db";

// Runtime configured in vercel.json — env vars injected by Vercel automatically

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const COOKIE_NAME = "app_session_id";

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";

  if (error) {
    console.error("[Google OAuth Callback] Error from Google:", error);
    return Response.redirect(`${appUrl}/?auth=error`, 302);
  }

  if (!code) {
    return new Response("Missing OAuth code", { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const jwtSecret = process.env.JWT_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!clientId || !clientSecret || !jwtSecret || !adminEmail) {
    console.error("[Google OAuth Callback] Missing required env vars");
    return new Response("Server configuration error", { status: 500 });
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
      return new Response("Token exchange failed", { status: 500 });
    }

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      id_token?: string;
    };

    if (!tokenData.access_token) {
      return new Response("No access token received", { status: 500 });
    }

    // Step 2: Get user info from Google
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    if (!userInfoRes.ok) {
      return new Response("Failed to fetch user info from Google", {
        status: 500,
      });
    }

    const userInfo = (await userInfoRes.json()) as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    // Step 3: Check admin access
    if (!userInfo.email || userInfo.email !== adminEmail) {
      console.warn(
        `[Google OAuth Callback] Unauthorized login attempt: ${userInfo.email}`
      );
      return Response.redirect(`${appUrl}/?auth=unauthorized`, 302);
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

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${appUrl}/admin`,
        "Set-Cookie": `${COOKIE_NAME}=${sessionToken}; ${cookieFlags}`,
      },
    });
  } catch (err) {
    console.error("[Google OAuth Callback] Unexpected error:", err);
    return new Response("OAuth callback failed", { status: 500 });
  }
}
