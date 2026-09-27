// server/api/auth/google.ts
function handler(req, res) {
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
    prompt: "select_account"
  });
  res.writeHead(302, {
    Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  });
  res.end();
}
function getAppUrl(req) {
  if (process.env.VITE_APP_URL) {
    return process.env.VITE_APP_URL.replace(/\/+$/, "");
  }
  const rawHost = req.headers["x-forwarded-host"] || req.headers.host || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (rawHost) {
    const host = rawHost.split(",")[0].trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    const rawProto = req.headers["x-forwarded-proto"] || "";
    const proto = rawProto.split(",")[0].trim() || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}
export {
  handler as default
};
