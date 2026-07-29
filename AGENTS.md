# BurgerForge AI engineering rules

## Product boundary

- One focused burger-idea product, not a generic chatbot.
- No restaurant ordering, payments or accounts.
- No verified nutrition, health, medical-diet, allergen or food-safety claims.
- Never automatically save generated output.
- Board and journal remain browser-local in the portfolio release.

## Source of truth

- Curated ideas: `src/content/burgers.mjs`.
- Text normalization: `src/lib/text-core.mjs`.
- Suggestion contract/fallback: `src/lib/suggestion-core.mjs`.
- Board schema: `src/lib/board-core.mjs`.
- API handlers: `src/server/handlers.mjs`.
- Vercel Node/Fetch adapter: src/server/vercel-adapter.mjs.
- Pages: `src/templates/pages.mjs`.
- Design: `src/static/assets/site.css`.

## AI rules

- Provider key server-side only.
- Exactly three suggestions.
- Validate structured output.
- Ten-second provider timeout.
- No raw provider response or error in public output.
- No prompt/preference logging.
- No allergen or nutrition certification.
- Always retain deterministic fallback.

## Local state

```text
burgerforge:theme:v1
burgerforge:board:v2
```

- Max 50 board records.
- Max rating 5.
- Max note 800.
- Never call `localStorage.clear()`.

## Release gate

Run:

```bash
npm ci --ignore-scripts
npm audit --omit=dev
npm run verify
git diff --check
```

Do not commit `dist`, `.vercel`, `node_modules`, archives or environment values.
