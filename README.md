# BurgerForge AI

Build it. Stack it. Devour it.

BurgerForge AI is a local-first burger idea builder, Devour Board and private Tasting Journal. It is a clean-room evolution of the uploaded Eat Da Burger CRUD exercise and uses the uploaded Vercel AI SDK repository as an architectural reference rather than copying its monorepo.

## Product features

- Manual burger entry.
- AI Burger Builder with exactly three structured suggestions.
- Deterministic provider-independent fallback.
- Eight original curated burger blueprints.
- User-controlled add-to-board action.
- Queued and devoured states without page reloads.
- Private ratings and tasting notes.
- Export, import and clear controls.
- Light, dark and system themes.
- PWA manifest, service worker and offline route.
- Food/AI safety and privacy pages.
- GET health Function and POST suggestion Function.

## Important boundary

BurgerForge produces creative concepts. It does not verify allergens, nutrition, medical diets, ingredient labels, cooking temperatures, cross-contact, restaurant availability or food safety.

## Architecture

```text
static generated pages + local state + two Vercel Functions
```

The complete product works without any provider secret. When optional Vercel AI Gateway configuration is absent or fails, the Function returns three deterministic suggestions.

## Commands

```bash
npm ci --ignore-scripts
npm run dev
npm run lint
npm test
npm run build
npm run smoke
npm run verify
```

Local preview defaults to `http://127.0.0.1:4173`.

## Environment

```text
AI_GATEWAY_API_KEY=
BURGERFORGE_AI_MODEL=
BURGERFORGE_LIVE_AI=0
SITE_URL=
BURGERFORGE_PUBLIC_INDEXING=0
```

Never use a browser-prefixed secret.

## Routes

```text
/
/builder/
/ideas/
/board/
/journal/
/about/
/safety/
/privacy/
/offline/
/404/
```

## APIs

```text
GET  /api/health
POST /api/ai/burger-suggestions
```

## Documentation

- `docs/audit-report.md`
- `docs/architecture.md`
- `docs/source-inventory.md`
- `docs/owner-decisions.md`
- `docs/verification-report.md`
- `DEPLOYMENT.md`
- `SECURITY.md`
- `NOTICE.md`

## Licence

No clean-room source licence has been assigned. The historical project has conflicting ISC/MIT metadata and no included licence file. Resolve ownership and licensing before redistribution.
