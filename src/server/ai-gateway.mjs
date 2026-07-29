import { BURGER_JSON_SCHEMA, normalizePreferences, validateSuggestionPayload } from "../lib/suggestion-core.mjs";

const ENDPOINT = "https://ai-gateway.vercel.sh/v1/chat/completions";

export function liveAIState(env = process.env) {
  const requested = env.BURGERFORGE_LIVE_AI === "1";
  const configured = Boolean(env.AI_GATEWAY_API_KEY && env.BURGERFORGE_AI_MODEL);
  return { requested, configured, enabled: requested && configured, model: configured ? env.BURGERFORGE_AI_MODEL : null };
}

function systemPrompt() {
  return [
    "You design creative but realistic burger concepts for a fictional portfolio application.",
    "Return exactly three suggestions matching the supplied JSON schema.",
    "Respect explicit ingredient exclusions.",
    "Do not claim any concept is allergen-free, safe for a medical diet, nutritionally verified, healthy, or restaurant-certified.",
    "Dietary tags describe an idea only and must use words such as preference or concept.",
    "Keep names suitable for a menu and ingredient lists practical.",
    "Never include raw meat safety guarantees; include a short preparation caution where useful."
  ].join(" ");
}

export async function requestLiveSuggestions(rawPreferences, { env = process.env, fetchImpl = fetch, signal } = {}) {
  const state = liveAIState(env);
  if (!state.enabled) return { ok: false, code: "ai_unconfigured" };
  const preferences = normalizePreferences(rawPreferences);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error("timeout")), 10_000);
  if (signal) signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });
  try {
    const response = await fetchImpl(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${env.AI_GATEWAY_API_KEY}` },
      body: JSON.stringify({
        model: env.BURGERFORGE_AI_MODEL,
        temperature: 0.7,
        max_tokens: 1200,
        messages: [
          { role: "system", content: systemPrompt() },
          { role: "user", content: JSON.stringify({ task: "Create exactly three burger concepts.", preferences }) }
        ],
        response_format: { type: "json_schema", json_schema: BURGER_JSON_SCHEMA }
      }),
      signal: controller.signal
    });
    if (!response.ok) return { ok: false, code: response.status === 429 ? "provider_rate_limited" : "provider_failed" };
    const payload = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;
    const validated = validateSuggestionPayload(parsed);
    if (!validated) return { ok: false, code: "provider_invalid_output" };
    return { ok: true, value: validated, model: state.model };
  } catch (error) {
    return { ok: false, code: error?.name === "AbortError" ? "provider_timeout" : "provider_failed" };
  } finally {
    clearTimeout(timeout);
  }
}
