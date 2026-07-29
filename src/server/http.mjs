import { randomUUID } from "node:crypto";

export function json(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", ...headers } });
}
export function methodNotAllowed(allow) { return json({ error: { code: "method_not_allowed", message: "This method is not supported." } }, { status: 405, headers: { allow } }); }
export function requestId(request) { return request.headers.get("x-vercel-id") || request.headers.get("x-request-id") || randomUUID(); }
export async function readJson(request, maxBytes = 16_384) {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > maxBytes) throw Object.assign(new Error("request_too_large"), { status: 413 });
  const buffer = new Uint8Array(await request.arrayBuffer());
  if (buffer.byteLength > maxBytes) throw Object.assign(new Error("request_too_large"), { status: 413 });
  if (!buffer.byteLength) throw Object.assign(new Error("invalid_json"), { status: 400 });
  try { return JSON.parse(new TextDecoder().decode(buffer)); }
  catch { throw Object.assign(new Error("invalid_json"), { status: 400 }); }
}
