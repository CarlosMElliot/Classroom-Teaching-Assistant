import type { Env } from "./index";
import { classroomFetch } from "./classroom/client";

const tools = [
  { name: "list_courses", description: "List active Google Classroom courses taught by the authorized teacher.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: "list_students", description: "List students in a Google Classroom course.", inputSchema: { type: "object", properties: { courseId: { type: "string" } }, required: ["courseId"], additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: "list_coursework", description: "List assignments and coursework for a Google Classroom course.", inputSchema: { type: "object", properties: { courseId: { type: "string" } }, required: ["courseId"], additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: "list_announcements", description: "List announcements for a Google Classroom course.", inputSchema: { type: "object", properties: { courseId: { type: "string" } }, required: ["courseId"], additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: "list_topics", description: "List topics for a Google Classroom course.", inputSchema: { type: "object", properties: { courseId: { type: "string" } }, required: ["courseId"], additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false } },
  { name: "list_submissions", description: "List student submissions for a specific coursework item.", inputSchema: { type: "object", properties: { courseId: { type: "string" }, courseWorkId: { type: "string" } }, required: ["courseId", "courseWorkId"], additionalProperties: false }, annotations: { readOnlyHint: true, openWorldHint: false } }
];

function jsonRpc(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: "2.0", id, result });
}

async function callTool(env: Env, name: string, args: Record<string,string>) {
  const c = encodeURIComponent(args.courseId || "");
  const w = encodeURIComponent(args.courseWorkId || "");
  let path = "";
  if (name === "list_courses") path = "/courses?courseStates=ACTIVE&teacherId=me";
  if (name === "list_students") path = "/courses/" + c + "/students";
  if (name === "list_coursework") path = "/courses/" + c + "/courseWork";
  if (name === "list_announcements") path = "/courses/" + c + "/announcements";
  if (name === "list_topics") path = "/courses/" + c + "/topics";
  if (name === "list_submissions") path = "/courses/" + c + "/courseWork/" + w + "/studentSubmissions";
  if (!path) return { content: [{ type: "text", text: "Unknown tool" }], isError: true };
  const r = await classroomFetch(env, path);
  const text = await r.text();
  return { content: [{ type: "text", text }], isError: !r.ok };
}

export async function handleMcp(request: Request, env: Env) {
  if (request.method === "GET") return new Response("Classroom Teaching Assistant MCP", { status: 200 });
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const body = await request.json<any>();
  if (body.method === "initialize") return jsonRpc(body.id, { protocolVersion: "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "classroom-teaching-assistant", version: "0.3.0" }, instructions: "Read-only access to the authorized teacher's Google Classroom. Resolve course IDs with list_courses before requesting course-specific data." });
  if (body.method === "notifications/initialized") return new Response(null, { status: 202 });
  if (body.method === "tools/list") return jsonRpc(body.id, { tools });
  if (body.method === "tools/call") return jsonRpc(body.id, await callTool(env, body.params?.name, body.params?.arguments || {}));
  return Response.json({ jsonrpc: "2.0", id: body.id ?? null, error: { code: -32601, message: "Method not found" } }, { status: 404 });
}
