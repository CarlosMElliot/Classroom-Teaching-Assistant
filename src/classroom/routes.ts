import { Hono } from "hono";
import type { Env } from "../index";
import { classroomFetch } from "./client";

export const classroomRoutes = new Hono<{ Bindings: Env }>();

classroomRoutes.use("*", async (c, next) => {
  if (c.env.APP_AUTH_TOKEN) {
    const supplied = c.req.header("authorization");

    if (supplied !== "Bearer " + c.env.APP_AUTH_TOKEN) {
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  await next();
});

classroomRoutes.get("/courses", async (c) => {
  const response = await classroomFetch(
    c.env,
    "/courses?courseStates=ACTIVE&teacherId=me"
  );

  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": "application/json" }
  });
});

classroomRoutes.get("/courses/:courseId/students", async (c) => {
  const courseId = encodeURIComponent(c.req.param("courseId"));
  const response = await classroomFetch(
    c.env,
    "/courses/" + courseId + "/students"
  );

  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": "application/json" }
  });
});

classroomRoutes.get("/courses/:courseId/courseWork", async (c) => {
  const courseId = encodeURIComponent(c.req.param("courseId"));
  const response = await classroomFetch(
    c.env,
    "/courses/" + courseId + "/courseWork"
  );

  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": "application/json" }
  });
});

classroomRoutes.post("/courses/:courseId/courseWork", async (c) => {
  const courseId = encodeURIComponent(c.req.param("courseId"));
  const payload = await c.req.json();

  const response = await classroomFetch(
    c.env,
    "/courses/" + courseId + "/courseWork",
    {
      method: "POST",
      body: JSON.stringify(payload)
    }
  );

  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": "application/json" }
  });
});
