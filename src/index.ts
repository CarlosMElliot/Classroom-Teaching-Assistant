import { Hono } from "hono";
import { googleAuthRoutes } from "./auth/google";
import { classroomRoutes } from "./classroom/routes";

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
  version: "0.2.0"
}));

app.route("/oauth/google", googleAuthRoutes);
app.route("/api/classroom", classroomRoutes);

export default app;
