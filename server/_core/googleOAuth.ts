import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";

/**
 * Direct Google OAuth 2.0 flow — no Manus platform required.
 * Uses GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET from .env.
 */
export function registerGoogleOAuthRoutes(app: Express) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("[Google OAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — /admin Google login will not work.");
    return;
  }

  // Step 1: Redirect user to Google's authorization endpoint
  app.get("/api/auth/google", (_req: Request, res: Response) => {
    const redirectUri = `${process.env.VITE_APP_URL ?? "http://localhost:3000"}/api/auth/google/callback`;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  });

  // Step 2: Handle Google's callback with auth code
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    if (!code) {
      res.status(400).send("Missing OAuth code from Google");
      return;
    }

    try {
      const redirectUri = `${process.env.VITE_APP_URL ?? "http://localhost:3000"}/api/auth/google/callback`;

      // Exchange code for tokens
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
        const err = await tokenRes.text();
        console.error("[Google OAuth] Token exchange failed:", err);
        res.status(500).send("Token exchange failed");
        return;
      }

      const tokenData = (await tokenRes.json()) as { id_token?: string; access_token?: string };

      // Fetch user info from Google
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoRes.ok) {
        res.status(500).send("Failed to fetch user info from Google");
        return;
      }

      const userInfo = (await userInfoRes.json()) as {
        sub: string;
        email?: string;
        name?: string;
        picture?: string;
      };

      const openId = `google_${userInfo.sub}`;
      const email = userInfo.email ?? null;
      const name = userInfo.name ?? email ?? "Google User";

      // Check admin access
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail || email !== adminEmail) {
        console.warn(`[Google OAuth] Unauthorized login attempt: ${email}`);
        res.redirect("/?auth=unauthorized");
        return;
      }

      // Upsert user in DB
      await db.upsertUser({ openId, name, email, loginMethod: "google", lastSignedIn: new Date(), role: "admin" });

      // Create JWT session (same format the rest of the app expects)
      const sessionToken = await sdk.createSessionToken(openId, { name, expiresInMs: ONE_YEAR_MS });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect("/admin");
    } catch (err) {
      console.error("[Google OAuth] Callback error:", err);
      res.status(500).send("OAuth callback failed");
    }
  });

  console.log("[Google OAuth] Routes registered: GET /api/auth/google, GET /api/auth/google/callback");
}
