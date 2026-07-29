# Verification report

## Environment

```text
Node.js: v24.18.0
npm: 10.2.4
Production target: Node.js 24.x
```

The local runtime matches the intended Vercel major version.

## Installation, audit, and automated gate

```text
npm ci --ignore-scripts: passed
installed package records: 1
external npm dependencies: 0
npm audit --omit=dev: 0 vulnerabilities
intended source files: 62
JavaScript syntax files: 28 passed
source/config policy files: 43 passed
node:test tests: 23 passed, 0 failed
canonical documents: 10
physical HTML files: 11
build assertions: 139 passed
HTTP smoke assertions: 76 passed
generated files: 27
generated output: 214,729 bytes
browser/shared JavaScript: 37,537 bytes
CSS: 25,291 bytes
deterministic generated-tree SHA-256:
3987a739030e52d5f7541ea61647e1658bb9be76dcacdbd9890d511918cf4fdd
```

The complete local gate, `git diff --check`, and an independent clean-room install/audit/verify passed. The output remains below every release budget. No external package or untracked generated file is required.

## Direct local browser verification

Production-style navigation ran against `http://127.0.0.1:4187` in managed Chromium.

```text
canonical/designed routes: 10
route and viewport combinations: 40
viewports: 390×844, 768×1024, 1440×900, 1536×1024
unexpected console errors: 0
designed-404 navigation messages: 5
page errors: 0
unexpected failed requests: 0
CSP violations: 0
unexpected Board/Journal network writes: 0
horizontal-overflow defects: 0
duplicate document IDs: 0
service-worker registrations: 1
```

The five classified 404 console messages are the expected browser resource messages from the designed 404 route at four viewports plus its screenshot run. They are not application exceptions or unexpected failed resources.

Verified interactions:

- desktop and mobile navigation, Escape dismissal, active route, theme persistence, and command palette;
- manual add, mark devoured, undo, Board counts and filters;
- deterministic Builder with exactly three cards and explicit selected add;
- curated search, no-result state, and explicit selected add;
- safe export filename and malformed-import feedback;
- Journal rating, note persistence, and visible local-save confirmation;
- service-worker registration, no API cache entries, and true offline navigation;
- one main and h1, named buttons, labelled controls, unique IDs, and no horizontal overflow.

Evidence is in `docs/evidence/browser-verification.json` and eight screenshots:

- Home desktop and mobile
- Builder desktop
- Ideas desktop
- Board mobile
- Journal desktop
- Safety desktop
- Designed 404 mobile

## Browser-driven corrections

Direct browser evidence found and fixed:

- duplicate inline SVG definition IDs across repeated burger artwork;
- the Journal save confirmation being written to a detached card after rerender.
- insufficient contrast in primary actions, step numbers, dark-section links, and accent eyebrow text found by Preview Lighthouse.

The build verifier now checks every physical HTML document for duplicate IDs.

Preview runtime logs also proved that Vercel invokes file Functions with Node request/response objects. A tested boundary adapter now converts those objects to and from the shared Fetch contracts; both health and POST suggestion bodies have regression coverage.

## High-confidence policy and secret scan

The lint policy rejects browser-prefixed secrets, high-confidence common key patterns, database URLs, legacy full-page reloads, and disallowed framework/runtime imports. Source, config, tests, docs, diff, and generated output produced zero high-confidence secret findings. No environment value or uploaded archive is tracked.

## Remaining external release verification

The following values must be measured against the exact final Git-connected Preview and merged Production deployment and are not claimed by this local report:

- GitHub Actions conclusion for the final PR SHA;
- Vercel deployment identity, build logs, Functions, runtime logs, and stable alias;
- automated axe results on HTTPS Preview and Production;
- Lighthouse scores on Preview and Production;
- install-prompt behaviour on an eligible device/browser;
- optional live-AI provider quality (the experiment is skipped unless separately approved).
