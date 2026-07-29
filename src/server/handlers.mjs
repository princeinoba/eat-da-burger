import { CURATED_BURGERS, DEMO_DISCLOSURE } from "../content/burgers.mjs";
import { makeFallbackSuggestions, normalizePreferences } from "../lib/suggestion-core.mjs";
import { liveAIState, requestLiveSuggestions } from "./ai-gateway.mjs";
import { json, methodNotAllowed, readJson, requestId } from "./http.mjs";

const buckets = new Map();
function rateLimit(request, now = Date.now()) {
  const key = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "local").split(",")[0].trim();
  const existing = buckets.get(key) || { startedAt: now, count: 0 };
  const bucket = now - existing.startedAt > 10 * 60_000 ? { startedAt: now, count: 0 } : existing;
  bucket.count += 1;
  buckets.set(key, bucket);
  return { allowed: bucket.count <= 12, retryAfter: Math.max(1, Math.ceil((bucket.startedAt + 10 * 60_000 - now) / 1000)) };
}

export async function handleHealth(request, { env = process.env } = {}) {
  if (request.method !== "GET") return methodNotAllowed("GET");
  const ai = liveAIState(env);
  return json({
    status: "ok",
    product: "BurgerForge AI",
    classification: "local-first fictional burger idea and tasting-board portfolio demonstration",
    catalogue: { curatedIdeas: CURATED_BURGERS.length },
    capabilities: { accounts: false, database: false, ordering: false, payments: false, nutritionVerification: false, allergenVerification: false, localBoard: true, localJournal: true, deterministicSuggestions: true, optionalLiveAI: ai.enabled },
    ai: { requested: ai.requested, configured: ai.configured, enabled: ai.enabled, model: ai.model },
    requestId: requestId(request)
  }, { headers: { "cache-control": "no-store" } });
}

export async function handleSuggestions(request, dependencies = {}) {
  if (request.method !== "POST") return methodNotAllowed("POST");
  const id = requestId(request);
  const limit = rateLimit(request, dependencies.now?.() || Date.now());
  if (!limit.allowed) return json({ error: { code: "rate_limited", message: "Too many burger builds. Try again shortly." }, requestId: id }, { status: 429, headers: { "cache-control": "no-store", "retry-after": String(limit.retryAfter) } });
  try {
    const body = await readJson(request, 16_384);
    const preferences = normalizePreferences(body);
    const fallback = makeFallbackSuggestions(preferences);
    const live = await requestLiveSuggestions(preferences, dependencies);
    const value = live.ok ? live.value : fallback;
    return json({
      suggestions: value.suggestions,
      mode: live.ok ? "live-ai" : "local-fallback",
      warning: DEMO_DISCLOSURE,
      providerStatus: live.ok ? "ok" : live.code,
      requestId: id
    }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const status = error.status || (error instanceof TypeError ? 422 : 400);
    const code = error.message === "request_too_large" ? "request_too_large" : error.message === "invalid_json" ? "invalid_json" : "invalid_preferences";
    return json({ error: { code, message: code === "request_too_large" ? "The request is too large." : code === "invalid_json" ? "Send a valid JSON request." : "Check the burger preferences and try again." }, requestId: id }, { status, headers: { "cache-control": "no-store" } });
  }
}

export function resetRateLimitsForTests() { buckets.clear(); }
