import type { Env } from "../index";

export async function getAccessToken(env: Env): Promise<string> {
  if (!env.GOOGLE_REFRESH_TOKEN) {
    throw new Error("GOOGLE_REFRESH_TOKEN is not configured");
  }

  const body = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_REFRESH_TOKEN,
    grant_type: "refresh_token"
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) {
    throw new Error("Unable to refresh Google access token");
  }

  const data = await response.json<{ access_token: string }>();
  return data.access_token;
}

export async function classroomFetch(
  env: Env,
  path: string,
  init: RequestInit = {}
) {
  const token = await getAccessToken(env);
  const headers = new Headers(init.headers);
  headers.set("authorization", "Bearer " + token);

  if (init.body) {
    headers.set("content-type", "application/json");
  }

  return fetch("https://classroom.googleapis.com/v1" + path, {
    ...init,
    headers
  });
}
