import test from "node:test";
import assert from "node:assert/strict";
import { handleHealth, handleSuggestions, resetRateLimitsForTests } from "../src/server/handlers.mjs";

function request(path, init = {}) { return new Request(`https://example.test${path}`, init); }

test("health reports a safe local-first product", async () => {
  const response = await handleHealth(request("/api/health"), { env: {} });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const value = await response.json();
  assert.equal(value.product, "BurgerForge AI");
  assert.equal(value.capabilities.accounts, false);
  assert.equal(value.capabilities.database, false);
  assert.equal(value.capabilities.optionalLiveAI, false);
  assert.equal(value.catalogue.curatedIdeas, 8);
});

test("health rejects mutation methods", async () => {
  const response = await handleHealth(request("/api/health", { method: "POST" }));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "GET");
});

test("suggestion endpoint returns deterministic fallback without secrets", async () => {
  resetRateLimitsForTests();
  const response = await handleSuggestions(request("/api/ai/burger-suggestions", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "1.2.3.4" }, body: JSON.stringify({ protein: "chicken", style: "spicy", includeIngredients: ["avocado"] }) }), { env: {} });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const value = await response.json();
  assert.equal(value.mode, "local-fallback");
  assert.equal(value.suggestions.length, 3);
  assert.ok(!JSON.stringify(value).includes("AI_GATEWAY_API_KEY"));
});

test("invalid JSON returns a bounded 400", async () => {
  resetRateLimitsForTests();
  const response = await handleSuggestions(request("/api/ai/burger-suggestions", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "2.2.2.2" }, body: "{" }), { env: {} });
  assert.equal(response.status, 400);
  const value = await response.json();
  assert.equal(value.error.code, "invalid_json");
});

test("oversized requests are rejected", async () => {
  resetRateLimitsForTests();
  const response = await handleSuggestions(request("/api/ai/burger-suggestions", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "3.3.3.3" }, body: JSON.stringify({ notes: "x".repeat(17000) }) }), { env: {} });
  assert.equal(response.status, 413);
});

test("GET is rejected on the POST-only suggestion route", async () => {
  const response = await handleSuggestions(request("/api/ai/burger-suggestions"));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
});

test("live provider output is accepted only through the validated schema", async () => {
  resetRateLimitsForTests();
  const providerPayload = { suggestions: Array.from({ length: 3 }, (_, index) => ({ name: `Live Stack ${index}`, description: "A realistic structured burger concept for testing.", ingredients: ["patty", "slaw", "sauce"], dietaryTags: [], prepNotes: "Verify ingredients.", fitReasons: ["Matches the brief"], spiceLevel: "medium", style: "gourmet" })) };
  const fetchImpl = async () => new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(providerPayload) } }] }), { status: 200, headers: { "content-type": "application/json" } });
  const response = await handleSuggestions(request("/api/ai/burger-suggestions", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "4.4.4.4" }, body: JSON.stringify({}) }), { env: { BURGERFORGE_LIVE_AI: "1", AI_GATEWAY_API_KEY: "secret-test-value", BURGERFORGE_AI_MODEL: "provider/model" }, fetchImpl });
  const value = await response.json();
  assert.equal(value.mode, "live-ai");
  assert.equal(value.suggestions[0].name, "Live Stack 0");
  assert.ok(!JSON.stringify(value).includes("secret-test-value"));
});

test("rate limit returns 429 after the bounded window count", async () => {
  resetRateLimitsForTests();
  let last;
  for (let index = 0; index < 13; index += 1) last = await handleSuggestions(request("/api/ai/burger-suggestions", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "5.5.5.5" }, body: "{}" }), { env: {}, now: () => 1000 });
  assert.equal(last.status, 429);
  assert.ok(Number(last.headers.get("retry-after")) > 0);
});
