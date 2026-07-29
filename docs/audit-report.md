# BurgerForge AI — complete product, architecture, code and UX audit

## Executive assessment

The original project is a charming database-learning exercise, not a production-ready product. Its complete journey is:

```text
enter a name → add to queue → mark devoured → delete
```

The AI archive is not a second burger application. It is Vercel's entire AI SDK monorepo. Its most relevant ideas are structured output, streaming feedback, provider abstraction and server-side credential handling. Copying that repository into Eat Da Burger would make the product dramatically harder to understand and maintain.

The recommended evolution is **BurgerForge AI**: a local-first burger idea builder, Devour Board and private Tasting Journal. It uses one narrow optional AI function and always retains a deterministic fallback.

---

## 1. Product architecture audit

### Observation P1 — The original product has no journey beyond the CRUD exercise

**Evidence:** `views/index.handlebars:9-43`, `public/assets/js/burger.js:1-44`, and `db/schema.sql:6-10` expose only a burger name, a Boolean devoured state and delete.

**Impact:** There is no reason to return after the database exercise has been demonstrated. The app cannot explain a burger, compare ideas, record a tasting or turn AI into meaningful user value.

**Implemented recommendation:** Keep the playful queue but connect it to:

```text
brief → three concepts → explicit selection → queue → devoured → rating and note
```

### Observation P2 — The two archives are not comparable application modules

**Evidence:** Eat Da Burger contains 19 non-Git files and 6 JavaScript files. `ai.zip` contains a private multi-package SDK repository with 110 package manifests and 7,000+ extracted files. Its root `package.json` uses Turborepo and pnpm; the core package describes itself as a provider-agnostic toolkit.

**Impact:** A literal merge would bury a four-action product inside provider packages, examples, docs, release tooling and monorepo infrastructure.

**Implemented recommendation:** Consolidate useful *capabilities*, not repositories. BurgerForge independently implements a structured three-suggestion contract compatible with Vercel AI Gateway's OpenAI-style JSON Schema boundary.

### Observation P3 — The current architecture makes the public experience depend on MySQL

**Evidence:** `config/connection.js:5-23` opens a MySQL connection at module initialization and terminates the process on failure. `controllers/burgers_controller.js:11-14` requires the database to render the only page.

**Impact:** A database outage removes the entire portfolio experience. This is disproportionate for a personal burger board.

**Implemented recommendation:** The portfolio release is static and local-first. The board and journal live in versioned browser storage. Only the optional suggestion request reaches a Function.

### Observation P4 — There is no product safety boundary for AI-generated food content

**Evidence:** The legacy app has no AI. The uploaded recommendation correctly identifies that model-generated allergen and nutrition claims should not be presented as verified facts.

**Impact:** A generic food chatbot could make unsafe dietary or preparation claims and obscure the application's intended role.

**Implemented recommendation:** Live output is restricted to creative concepts. Every page and response states that allergens, nutrition, medical diets and food preparation are not verified. The provider prompt prohibits certification claims, and invalid output falls back.

---

## 2. Codebase and security audit

### Observation C1 — Missing input can throw before validation

**Evidence:** `models/burger.js:4-10` immediately reads `burger_name.length`. A missing, null or non-string value throws a TypeError.

**Severity:** High for API reliability.

**Implemented correction:** Shared normalization requires a string, removes control characters, trims whitespace and applies explicit length limits. Invalid preferences return bounded 4xx errors.

### Observation C2 — Update accepts request-body properties too broadly

**Evidence:** `controllers/burgers_controller.js:39-50` applies `Object.assign(burger, req.body, { id })`. The ORM then writes the object with a generic `UPDATE ... SET ?` call.

**Severity:** High.

**Impact:** The public request body controls more of the persistence object than the operation requires.

**Implemented correction:** The new public API has no burger mutation endpoint. Board mutations use allowlisted local-domain functions. The suggestion endpoint accepts only known preference fields.

### Observation C3 — Raw errors become public responses

**Evidence:** `controllers/burgers_controller.js:21-23`, `34-36`, `48-50`, and `60-62` serialize caught errors directly.

**Impact:** Internal provider, database or implementation details may reach the browser.

**Implemented correction:** Errors use stable public codes and generic messages. Provider bodies and secrets are never returned.

### Observation C4 — Credentials default to `root/root`

**Evidence:** `config/connection.js:9-14` hardcodes localhost, user `root`, password `root`, and database `burgers_db`.

**Severity:** High as a configuration practice.

**Implemented correction:** MySQL was removed from the portfolio boundary. Optional AI configuration uses server-side environment variables documented in `.env.example`.

### Observation C5 — Every mutation reloads the page

**Evidence:** `public/assets/js/burger.js:7-13`, `24-30`, and `38-42` call `location.reload()` after successful fetches.

**Impact:** The interface loses continuity, cannot show granular status, and cannot support undo, optimistic transitions or inline errors.

**Implemented correction:** The new browser app updates the board and journal immediately, announces status, and preserves page context.

### Observation C6 — No failure lifecycle exists in the browser

**Evidence:** All three promise chains in `public/assets/js/burger.js` only inspect `response.ok`; none has a catch, loading state, retry or error message.

**Implemented correction:** Builder skeletons, bounded error/fallback behaviour, form status, local-save notices and designed empty states are implemented.

### Observation C7 — The read query is unbounded and unordered

**Evidence:** `config/orm.js:4-7` executes `SELECT *` without order or limit.

**Impact:** The page and database work grow indefinitely and ordering is undefined.

**Implemented correction:** The browser board is capped at 50 normalized records. The release has no unbounded database read.

### Observation C8 — Repository metadata is misleading

**Evidence:** `package.json:2-18` identifies `bootcamp-burger`, another GitHub repository and another author, while the embedded origin is `princeinoba/eat-da-burger`. `package.json` declares ISC, but `README.md:38-40` says MIT and no licence file exists.

**Implemented correction:** The clean-room package, product, docs and provenance are accurate. No new licence is assigned without owner approval.

### Observation C9 — The dependency and deployment contract is stale

**Evidence:** `package.json:6-23` has no start, dev, lint or working test script. `README.md:8` links an old Heroku application and tells developers to edit database credentials manually.

**Environment finding:** A clean `npm ci` for the historical package could not complete because the available package mirror returned 404 responses for packages in the old lockfile. This is not presented as proof of upstream package removal or a vulnerability count.

**Implemented correction:** The new package has zero external dependencies and one complete `npm run verify` release gate.

### Observation C10 — The original page depends on remote browser assets

**Evidence:** `views/layouts/main.handlebars:7-12` loads Bootstrap and Font Awesome from CDNs; `public/assets/css/style.css:14-22` imports Google Fonts.

**Impact:** Extra privacy, availability, CSP and rendering dependencies for a tiny app.

**Implemented correction:** CSS, icons, illustrations, manifest and social image are local.

---

## 3. UX audit

### Observation U1 — Blank list states look like missing content

**Evidence:** `views/index.handlebars:25-43` always renders two empty `<ul>` elements when no burgers exist.

**Implemented correction:** Builder, Idea Lab, board, journal and search/filter states have designed guidance and recovery actions.

### Observation U2 — “Submit Burger” is a system action, not a user goal

**Impact:** It describes a form submission rather than the experience.

**Implemented correction:** Actions now use product language: “Forge three ideas,” “Add to Devour Board,” “Mark devoured,” and “Move to queue.”

### Observation U3 — There is no onboarding for the AI feature

**Implemented correction:** The home page explains the four-stage journey, the user-control rule and the safety boundary before asking for preferences.

### Observation U4 — Accessibility depends on a third-party visual framework rather than a deliberate system

**Evidence:** The original page has a reasonable labelled form and image alt text, but lacks status announcements, empty-state guidance, robust focus flows and a local component system.

**Implemented correction:** Semantic pages, one main and h1, skip link, visible focus, labelled controls, live regions, keyboard command navigation, reduced motion, responsive touch targets and no unnamed buttons.

### Observation U5 — Mobile is responsive but not product-rich

**Evidence:** Bootstrap columns stack the two lists, but there is no responsive navigation, local filter model, board toolbar or tasting workflow.

**Implemented correction:** Mobile navigation, single-column board cards, horizontally safe filters and mobile-sized controls are verified at 390 px.

---

## 4. Developer productivity audit

### Original friction

- Application behaviour spans controller, model, generic ORM, Handlebars and browser scripts for a three-field record.
- Validation is incomplete and duplicated implicitly between HTML and model assumptions.
- No working test script.
- No deterministic build.
- No Preview contract.
- Database setup requires manual editing.
- Repository metadata and deployment docs are stale.

### Implemented productivity improvements

- One content source for curated burger ideas.
- Shared pure modules for text, suggestions and board state.
- Browser and server reuse the same fallback and validation code in the generated output.
- One static generator.
- One local Production-style server.
- Node's built-in test runner.
- Automated syntax, policy, content, API, build, HTTP, determinism and budget gates.
- Version-controlled Vercel settings and headers.
- No install-time third-party dependency graph.
- Clear optional-AI environment contract.

---

## 5. Quick wins completed

1. Corrected product identity and metadata.
2. Removed full-page reloads.
3. Added inline loading, success, fallback and error states.
4. Added bounded validation and safe public errors.
5. Removed MySQL and startup coupling from the portfolio release.
6. Replaced remote fonts/icons/framework CSS with local assets.
7. Added empty states, mobile navigation and semantic status updates.
8. Added exact three-card structured suggestions.
9. Added user-controlled selection before save.
10. Added board export/import and clear controls.
11. Added tasting ratings and private notes.
12. Added PWA and offline shell.
13. Added security headers and CSP.
14. Added tests, deterministic builds and output budgets.
15. Added Vercel-ready Functions and deployment docs.

---

## 6. Larger work deliberately deferred

A real shared recipe or restaurant product would require a separate programme:

- Accounts and ownership.
- Durable database and migrations.
- Distributed rate limiting.
- Moderation and abuse handling.
- Authoritative nutrition and allergen data.
- Recipe provenance and licensing.
- Ingredient substitutions and unit normalization.
- Commercial kitchen and food-safety review.
- Public sharing and community moderation.
- Analytics and consent.
- Retention, deletion, export and incident response.
- Provider budgets, evaluations and monitoring.

These systems were not fabricated inside a small Vercel portfolio release.
