// server/api/auth/google.ts
function handler(_req) {
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
    prompt: "select_account"
  });
  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302
  );
}
export {
  handler as default
};
