function getAppUrl(req: Request): string {
  if (process.env.VITE_APP_URL) {
    return process.env.VITE_APP_URL.replace(/\/+$/, "");
  }
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");

  if (host) {
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export default function handler(req: Request): Response {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = getAppUrl(req);

  if (!clientId) {
    return new Response("Google OAuth Client ID not configured", { status: 500 });
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

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302
  );
}
