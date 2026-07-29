import { Buffer } from "node:buffer";

function requestHeaders(request) {
  const headers = new Headers();
  for (const [name, raw] of Object.entries(request.headers || {})) {
    if (Array.isArray(raw)) for (const value of raw) headers.append(name, value);
    else if (raw !== undefined) headers.set(name, String(raw));
  }
  return headers;
}

async function requestBody(request) {
  if (["GET", "HEAD"].includes(request.method || "GET")) return undefined;
  if (request.body !== undefined) {
    if (typeof request.body === "string" || request.body instanceof Uint8Array) return request.body;
    return JSON.stringify(request.body);
  }
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return chunks.length ? Buffer.concat(chunks) : undefined;
}

export async function toWebRequest(request) {
  if (typeof request?.headers?.get === "function" && typeof request?.arrayBuffer === "function") return request;
  const headers = requestHeaders(request);
  const protocol = String(headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
  const host = String(headers.get("x-forwarded-host") || headers.get("host") || "localhost").split(",")[0].trim();
  const url = new URL(request.url || "/", `${protocol}://${host}`);
  const body = await requestBody(request);
  return new Request(url, { method: request.method || "GET", headers, body, duplex: body ? "half" : undefined });
}

export async function sendWebResponse(webResponse, response) {
  response.statusCode = webResponse.status;
  for (const [name, value] of webResponse.headers) response.setHeader(name, value);
  const body = Buffer.from(await webResponse.arrayBuffer());
  response.end(body);
}

export async function handleVercelNodeRequest(request, response, handler) {
  const webRequest = await toWebRequest(request);
  const webResponse = await handler(webRequest);
  return sendWebResponse(webResponse, response);
}
