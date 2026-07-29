# Vercel deployment

## Project settings

```text
Suggested project: burgerforge-ai
Framework preset: Other
Node.js: 24.x
Install command: npm ci --ignore-scripts
Build command: npm run build
Output directory: dist
Functions: api/**/*.js
Production branch: main
Region: iad1
```

`vercel.json` contains the build settings, Functions, redirects, CSP and security headers.

## Base deployment

No secret is required. The AI Builder returns deterministic suggestions.

Keep:

```text
BURGERFORGE_LIVE_AI=0
BURGERFORGE_PUBLIC_INDEXING=0
```

## Optional Vercel AI Gateway

Before enabling live AI:

1. Review the current AI Gateway model list and provider terms.
2. Select a current stable text model supporting structured JSON.
3. Review spend/budget and abuse controls.
4. Add project variables:

```text
AI_GATEWAY_API_KEY=<Sensitive>
BURGERFORGE_AI_MODEL=<current model ID>
BURGERFORGE_LIVE_AI=1
```

Apply to Preview first. Do not expose the key or use a browser-prefixed name. Create a fresh deployment after changing variables.

## Preview gate

Verify:

- All ten routes and the designed 404.
- `/api/health`.
- Local fallback mode.
- Live AI mode when enabled.
- Exactly three validated suggestions.
- Provider timeout, invalid-output and rate-limit fallback.
- Manual add, curated add and generated add.
- Queued/devoured/undo/delete/clear.
- Export/import.
- Rating and notes.
- Mobile navigation and themes.
- Service-worker registration and update.
- True offline navigation.
- axe and manual keyboard tests.
- Lighthouse.
- CSP/security headers.
- No console errors, secret exposure or unexpected failed requests.

## Production

Merge the exact verified pull-request commit normally into `main`, then require the Git-connected Production deployment to report the merged SHA.

Only set a stable Production `SITE_URL`. Never use a Preview URL permanently.

Normal indexing additionally requires:

```text
BURGERFORGE_PUBLIC_INDEXING=true
```

## Rollback

Record the previous Production deployment ID. Roll back through Vercel when a release regresses, then fix source through a normal branch and pull request. Browser-local records are not changed by a code rollback.
