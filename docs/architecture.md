# BurgerForge AI — product and technical architecture

## Product definition

**BurgerForge AI** is a local-first creative burger idea builder, Devour Board and private Tasting Journal.

It is not:

- A restaurant.
- An ordering service.
- A nutrition service.
- An allergen certification tool.
- Medical dietary advice.
- A verified recipe database.

## User journey

```text
manual or preference brief
→ exactly three structured concepts
→ user review
→ explicit add to board
→ queued or devoured state
→ rating and private tasting note
→ export/import or clear
```

## Runtime architecture

```text
Vercel CDN
├── ten generated canonical documents
├── local CSS, JavaScript, SVG and PNG assets
├── eight curated burger blueprints
├── versioned browser-local board and journal
├── manifest and service worker
└── Node.js Vercel Functions
    ├── GET  /api/health
    └── POST /api/ai/burger-suggestions
        ├── method/body validation
        ├── preference allowlist
        ├── bounded instance-level rate guard
        ├── deterministic three-idea fallback
        └── optional Vercel AI Gateway JSON-Schema request
```

## Why the AI SDK repository is not installed

The uploaded `ai.zip` is a full SDK monorepo rather than an application module. BurgerForge needs one narrow boundary, not agents, tools, provider packages, UI frameworks, examples, release infrastructure and hundreds of docs.

The release adopts the SDK's product lessons:

- Provider independence.
- Structured output.
- Responsive status.
- Server-only credentials.
- Validation before rendering.

The actual implementation uses the AI Gateway's OpenAI-compatible HTTP boundary and JSON Schema directly, preserving zero external npm dependencies.

## Browser state

### Key

```text
burgerforge:board:v2
```

### Record

```ts
interface BurgerRecord {
  id: string;
  name: string;             // 1–75
  description: string;      // 0–180
  ingredients: string[];    // 0–10
  dietaryTags: string[];    // 0–5, descriptive only
  prepNotes: string;        // 0–240
  fitReasons: string[];     // 0–3
  source: "manual" | "curated" | "ai" | "fallback";
  status: "queued" | "devoured";
  rating: 1 | 2 | 3 | 4 | 5 | null;
  note: string;             // 0–800
  createdAt: string;
  updatedAt: string;
}
```

Maximum records: 50.

All state is normalized on read. Wrong versions and malformed data resolve safely. Import is capped at 512 KB in the browser.

## Suggestion request

```ts
interface BurgerPreferences {
  protein: "surprise" | "beef" | "chicken" | "turkey" | "fish" | "plant" | "cheese";
  style: "surprise" | "classic" | "smash" | "gourmet" | "breakfast" | "spicy" | "international";
  spiceLevel: "mild" | "medium" | "hot";
  dietaryPreference: "none" | "vegetarian" | "vegan" | "gluten-aware" | "dairy-aware";
  includeIngredients: string[]; // max 5
  excludeIngredients: string[]; // max 8
  notes: string;                // max 240
}
```

Complete request body: max 16 KB.

## Suggestion response

```ts
interface SuggestionResponse {
  suggestions: [BurgerSuggestion, BurgerSuggestion, BurgerSuggestion];
  mode: "live-ai" | "local-fallback";
  warning: string;
  providerStatus: string;
  requestId: string;
}
```

No suggestion is persisted by the Function. The browser adds a selected idea only after explicit action.

## Live-AI boundary

Environment variables:

```text
AI_GATEWAY_API_KEY
BURGERFORGE_AI_MODEL
BURGERFORGE_LIVE_AI=1
```

The Function sends only the current bounded preference object. It does not send the board, ratings or tasting notes. It uses a ten-second timeout and rejects provider output that does not match the exact three-item schema.

The model may provide creative names, descriptions, ingredients, tags, fit reasons and prep notes. It may not provide verified nutrition, allergen, medical-diet, restaurant or food-safety claims.

## Rate boundary

The Function includes a small in-instance rate guard: 12 requests per ten minutes per forwarded client key. Serverless instances do not share this state. A publicly promoted, high-volume live-AI release should add a distributed limiter or Vercel-level abuse control after an owner-approved operating plan.

## Static and PWA boundary

The service worker caches public route shells and same-origin static assets. It never handles `/api/` requests. Navigation is network-first with an offline-page fallback.

## Indexing boundary

Initial release:

- Public pages: `noindex,follow`.
- Builder, board, journal, offline and 404: `noindex,nofollow`.
- `robots.txt`: disallow all.
- Empty sitemap.

Normal indexing requires both:

```text
BURGERFORGE_PUBLIC_INDEXING=true
stable Production origin
```

## Future durable architecture

If a later release needs cloud synchronization, introduce it as a separately governed system with authentication, ownership, data retention, moderation, distributed rate limiting, authoritative food data and privacy operations. Do not bolt a shared database onto the portfolio release without that programme.
