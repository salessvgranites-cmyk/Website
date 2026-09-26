// Runtime configured in vercel.json — env vars injected by Vercel automatically
export default function handler(_req: Request): Response {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.VITE_APP_URL;

  if (!clientId || !appUrl) {
    return new Response("OAuth not configured", { status: 500 });
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
