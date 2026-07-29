# Source inventory and provenance

## Reviewed inputs

| Input | SHA-256 | Role |
|---|---|---|
| `eat-da-burger.zip` | `f0db09a864f70eff4c17a44ffa650003d076b5a9c15192383de2d30fa7e317ec` | Original product and code evidence |
| `ai.zip` | `ffaa74d14f617cc5311bd57f2d0d9fe06673f74fe6e127f2de78134553b4e34d` | AI SDK architecture and interaction reference |
| `Pasted text(11).txt` | `42d6385e77144bfff1cacd83461fc51f4bf5ef1d926b974d5f5b65032148a8ed` | Prior evidence-based integration recommendation |

## Eat Da Burger

- Embedded origin: `https://github.com/princeinoba/eat-da-burger.git`
- Embedded HEAD: `01f395e6d0ccf3a44a390cb9526750020621d865`
- Non-Git files: 19
- JavaScript files: 6
- Stack: CommonJS, Express 4, Express Handlebars 5, MySQL through `mysql2`, Bootstrap 4, remote Font Awesome and Google Fonts.
- Data model: one `burgers` table with `id`, `burger_name`, and `devoured`.
- The extracted Git working tree looked modified because of line endings. `git diff --ignore-space-at-eol --quiet` passed, so no unpublished semantic changes were inferred.

### Licence inconsistency

`package.json` declares ISC and points to another author/repository. The README says MIT, but the archive contains no `LICENSE` file. The clean-room rebuild therefore does not copy the historical implementation and does not assign a new licence without owner approval.

## Vercel AI SDK repository

- Embedded origin: `https://github.com/vercel/ai.git`
- Embedded HEAD: `a56fbc08fd5c171574a499babfbd82f0b2a7b3fe`
- Source archive size: approximately 340 MB, dominated by embedded Git history.
- Extracted non-Git source: approximately 7,231 files.
- JavaScript/TypeScript source files: approximately 5,588.
- Package manifests: 110.
- Workspace packages: 70.
- Examples: 25.
- Documentation MDX files: approximately 275.
- Core `ai` package in the uploaded snapshot: 7.0.42, ESM, Node 22+, Apache-2.0.
- Root monorepo uses pnpm, Turborepo, TypeScript, changesets, Playwright and Vitest.

### Useful capabilities retained as product concepts

- Provider-independent model boundary.
- Structured JSON output.
- Responsive generation status.
- Server-only provider credentials.
- Express/Node compatibility as architectural evidence.

### Explicitly excluded

- The full monorepo.
- Provider packages and examples unrelated to the feature.
- Agents, tool loops and generic chatbot UI.
- Image, code, spreadsheet, weather and retrieval tools.
- Turborepo, pnpm workspace and release infrastructure.

## Clean-room selection

A literal merge would combine a 260-line CRUD application with a roughly 750,000-line SDK repository. BurgerForge AI instead preserves the burger queue metaphor and independently implements a narrow structured suggestion contract, local state, deterministic fallback, tests, static pages and two Vercel Functions.
