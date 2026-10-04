import { Hono } from "hono";
import type { Env } from "../index";

export const googleAuthRoutes = new Hono<{ Bindings: Env }>();

const scopes = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.rosters",
  "https://www.googleapis.com/auth/classroom.coursework.students",
  "https://www.googleapis.com/auth/classroom.announcements",
  "https://www.googleapis.com/auth/classroom.courseworkmaterials",
  "https://www.googleapis.com/auth/classroom.topics"
];

googleAuthRoutes.get("/start", (c) => {
  const callback = new URL(c.req.url);
  callback.pathname = c.env.GOOGLE_REDIRECT_PATH;
  callback.search = "";

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: callback.toString(),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    scope: scopes.join(" ")
  });

  return c.redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString()
  );
});

googleAuthRoutes.get("/callback", async (c) => {
  const code = c.req.query("code");
  if (!code) return c.json({ error: "Missing OAuth authorization code" }, 400);

  const callback = new URL(c.req.url);
  callback.search = "";

  const body = new URLSearchParams({
    code,
    client_id: c.env.GOOGLE_CLIENT_ID,
    client_secret: c.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: callback.toString(),
    grant_type: "authorization_code"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    return c.json({ error: "Google token exchange failed" }, 502);
  }

  const token = await response.json<Record<string, unknown>>();

  return c.json({
    connected: true,
    refresh_token_received: Boolean(token.refresh_token),
    next:
      "Store the refresh token securely as a Cloudflare secret. Do not expose it in GitHub."
  });
});
