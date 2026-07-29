import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { handleHealth, handleSuggestions, resetRateLimitsForTests } from "../src/server/handlers.mjs";
import { handleVercelNodeRequest } from "../src/server/vercel-adapter.mjs";

function nodeRequest({ method = "GET", url = "/", headers = {}, body } = {}) {
  const request = Readable.from(body === undefined ? [] : [Buffer.from(body)]);
  Object.assign(request, { method, url, headers: { host: "example.test", ...headers } });
  return request;
}

function nodeResponse() {
  const headers = new Map();
  let resolve;
  const completed = new Promise(value => { resolve = value; });
  return {
    response: {
      statusCode: 200,
      setHeader(name, value) { headers.set(name.toLowerCase(), value); },
      end(body) { resolve({ status: this.statusCode, headers, body: Buffer.from(body || []).toString("utf8") }); }
    },
    completed
  };
}

test("Vercel Node adapter serves the safe health contract", async () => {
  const request = nodeRequest({ url: "/api/health/", headers: { "x-vercel-id": "iad1::adapter-health" } });
  const { response, completed } = nodeResponse();
  await handleVercelNodeRequest(request, response, handleHealth);
  const result = await completed;
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal(JSON.parse(result.body).requestId, "iad1::adapter-health");
});

test("Vercel Node adapter preserves POST JSON for deterministic suggestions", async () => {
  resetRateLimitsForTests();
  const body = JSON.stringify({ protein: "plant", style: "gourmet", spiceLevel: "mild" });
  const request = nodeRequest({ method: "POST", url: "/api/ai/burger-suggestions/", headers: { "content-type": "application/json", "content-length": String(Buffer.byteLength(body)), "x-forwarded-for": "adapter-test" }, body });
  const { response, completed } = nodeResponse();
  await handleVercelNodeRequest(request, response, requestValue => handleSuggestions(requestValue, { env: {} }));
  const result = await completed;
  const value = JSON.parse(result.body);
  assert.equal(result.status, 200);
  assert.equal(value.mode, "local-fallback");
  assert.equal(value.suggestions.length, 3);
});
