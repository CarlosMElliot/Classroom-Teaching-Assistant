import { Hono } from "hono";
import type { Env } from "../index";

export const googleAuthRoutes = new Hono<{ Bindings: Env }>();

const scopes = [
  "https://www.googleapis.com/auth/classroom.courses.readonly"
];

googleAuthRoutes.get("/start", async (c) => {
  const callback = new URL(c.req.url);
  callback.pathname = c.env.GOOGLE_REDIRECT_PATH;
  callback.search = "";

  const state = crypto.randomUUID();
  await c.env.GOOGLE_TOKENS.put("oauth_state:" + state, "pending", { expirationTtl: 600 });

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: callback.toString(),
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
    scope: scopes.join(" ")
  });

  return c.redirect(
    "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString()
  );
});

googleAuthRoutes.get("/callback", async (c) => {
  const state = c.req.query("state");
  if (!state) return c.json({ error: "Missing OAuth state. Start authorization again." }, 400);

  const stateKey = "oauth_state:" + state;
  const pendingState = await c.env.GOOGLE_TOKENS.get(stateKey);
  if (!pendingState) return c.json({ error: "Invalid or expired OAuth state. Start authorization again." }, 400);
  await c.env.GOOGLE_TOKENS.delete(stateKey);

  const oauthError = c.req.query("error");
  if (oauthError) return c.json({ error: "Google authorization was not completed", google_error: oauthError }, 400);

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
  const refreshToken =
    typeof token.refresh_token === "string" ? token.refresh_token : undefined;

  if (!refreshToken) {
    return c.json({
      error: "Google did not return a refresh token.",
      next: "Revoke the app grant and authorize again with consent."
    }, 400);
  }

  await c.env.GOOGLE_TOKENS.put("primary_refresh_token", refreshToken);

  return c.json({
    connected: true,
    refresh_token_stored: true,
    next: "Google Classroom authorization is connected."
  });
});
