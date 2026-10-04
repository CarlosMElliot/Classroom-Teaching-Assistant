import { Hono } from "hono";
import { googleAuthRoutes } from "./auth/google";
import { classroomRoutes } from "./classroom/routes";
import { classroomFetch } from "./classroom/client";
import { handleMcp } from "./mcp";

export type Env = {
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REFRESH_TOKEN?: string;
  APP_AUTH_TOKEN?: string;
  GOOGLE_REDIRECT_PATH: string;
  GOOGLE_TOKENS: KVNamespace;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.json({
  service: "Classroom Teaching Assistant",
  status: "ok",
  version: "0.2.1"
}));

app.get("/health/classroom", async (c) => {
  try {
    const response = await classroomFetch(c.env, "/courses?courseStates=ACTIVE");
    if (!response.ok) {
      return c.json({ connected: false, classroom_api_status: response.status }, 502);
    }

    const data = await response.json<{ courses?: unknown[] }>();
    return c.json({
      connected: true,
      active_courses_visible: data.courses?.length ?? 0
    });
  } catch {
    return c.json({ connected: false }, 502);
  }
});

app.all("/mcp", (c) => handleMcp(c.req.raw, c.env));

app.route("/oauth/google", googleAuthRoutes);
app.route("/api/classroom", classroomRoutes);

export default app;
