import { Hono } from "hono";
import type { Env } from "../index";
import { classroomFetch } from "./client";

export const classroomRoutes = new Hono<{ Bindings: Env }>();

classroomRoutes.use("*", async (c, next) => {
  if (c.env.APP_AUTH_TOKEN && c.req.header("authorization") !== "Bearer " + c.env.APP_AUTH_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

function proxy(response: Response) {
  return new Response(response.body, {
    status: response.status,
    headers: { "content-type": "application/json" }
  });
}

classroomRoutes.get("/courses", async (c) =>
  proxy(await classroomFetch(c.env, "/courses?courseStates=ACTIVE&teacherId=me"))
);

classroomRoutes.get("/courses/:courseId/students", async (c) => {
  const id = encodeURIComponent(c.req.param("courseId"));
  return proxy(await classroomFetch(c.env, "/courses/" + id + "/students"));
});

classroomRoutes.get("/courses/:courseId/courseWork", async (c) => {
  const id = encodeURIComponent(c.req.param("courseId"));
  return proxy(await classroomFetch(c.env, "/courses/" + id + "/courseWork"));
});

classroomRoutes.get("/courses/:courseId/announcements", async (c) => {
  const id = encodeURIComponent(c.req.param("courseId"));
  return proxy(await classroomFetch(c.env, "/courses/" + id + "/announcements"));
});

classroomRoutes.get("/courses/:courseId/topics", async (c) => {
  const id = encodeURIComponent(c.req.param("courseId"));
  return proxy(await classroomFetch(c.env, "/courses/" + id + "/topics"));
});

classroomRoutes.get("/courses/:courseId/courseWork/:courseWorkId/submissions", async (c) => {
  const courseId = encodeURIComponent(c.req.param("courseId"));
  const workId = encodeURIComponent(c.req.param("courseWorkId"));
  return proxy(await classroomFetch(c.env, "/courses/" + courseId + "/courseWork/" + workId + "/studentSubmissions"));
});

classroomRoutes.post("/courses/:courseId/courseWork", async (c) => {
  const id = encodeURIComponent(c.req.param("courseId"));
  return proxy(await classroomFetch(c.env, "/courses/" + id + "/courseWork", {
    method: "POST", body: JSON.stringify(await c.req.json())
  }));
});

classroomRoutes.post("/courses/:courseId/announcements", async (c) => {
  const id = encodeURIComponent(c.req.param("courseId"));
  return proxy(await classroomFetch(c.env, "/courses/" + id + "/announcements", {
    method: "POST", body: JSON.stringify(await c.req.json())
  }));
});

classroomRoutes.post("/courses/:courseId/topics", async (c) => {
  const id = encodeURIComponent(c.req.param("courseId"));
  return proxy(await classroomFetch(c.env, "/courses/" + id + "/topics", {
    method: "POST", body: JSON.stringify(await c.req.json())
  }));
});

classroomRoutes.patch("/courses/:courseId/courseWork/:courseWorkId/submissions/:submissionId", async (c) => {
  const courseId = encodeURIComponent(c.req.param("courseId"));
  const workId = encodeURIComponent(c.req.param("courseWorkId"));
  const submissionId = encodeURIComponent(c.req.param("submissionId"));
  const payload = await c.req.json<Record<string, unknown>>();
  const fields = Object.keys(payload).filter((k) => ["draftGrade", "assignedGrade"].includes(k));
  if (!fields.length) return c.json({ error: "Only draftGrade and assignedGrade are supported" }, 400);
  const qs = new URLSearchParams({ updateMask: fields.join(",") });
  return proxy(await classroomFetch(c.env,
    "/courses/" + courseId + "/courseWork/" + workId + "/studentSubmissions/" + submissionId + "?" + qs.toString(),
    { method: "PATCH", body: JSON.stringify(payload) }
  ));
});
