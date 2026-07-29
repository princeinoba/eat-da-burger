# Implementation preflight

## Input integrity

All owner-supplied release inputs used by this rebuild matched the SHA-256 values in the master prompt:

- `eat-da-burger(1).zip`: `f0db09a864f70eff4c17a44ffa650003d076b5a9c15192383de2d30fa7e317ec`
- `ai.zip`: `ffaa74d14f617cc5311bd57f2d0d9fe06673f74fe6e127f2de78134553b4e34d`
- `Pasted%20text(11).txt`: `42d6385e77144bfff1cacd83461fc51f4bf5ef1d926b974d5f5b65032148a8ed`
- `burgerforge-ai-vercel-ready-source.zip`: `96e5889e7f066fcc6e1933807301809a555060e4fdbdb23683b69a575a3bb45c`
- `burgerforge-ai-complete-audit.md`: `ff177c270f3bb8c4e94ba993df7a2935093fb28d5b4862b846daaf91ae352e1f`
- `burgerforge-ai-architecture.md`: `ad52ab78c3729fd9c753cb50872de45a3ba5d917f1595d511c62a608f030b851`
- `burgerforge-ai-verification-report.md`: `e5948b4ca62d512a008b03414f922bde438f50d6bafd6e7acd226791e9ba9b36`
- `burgerforge-ai-source-inventory.md`: `29afc0dc3e630e0f6fced9688d4297874ee3b0b0d43c2bb3c7ee7c61285534e8`
- `burgerforge-ai-owner-decisions.md`: `c43dc035179d8613d722700d9602d852abd2733db2066c0d00f9e8f503998346`
- `burgerforge-ai-vercel-deployment-guide.md`: `36a24aa957c8e81702405d2a2f6e73e284d073a2eca28926ef49234e0ca85c0e`
- `burgerforge-ai-delivery-checksums.txt`: `b1317502c35485d2c7eaa212771eafa0506ae86941c88aab5ac143187785f54f`

The original Eat Da Burger archive arrived with `(1)` in its local filename; its content hash is the exact expected source hash. No mismatched artifact was substituted.

## Starting repository state

```text
Root: C:\Users\royce\OneDrive\Documents\eat-da-burger
Remote: https://github.com/princeinoba/eat-da-burger.git
Starting branch: main
Starting HEAD: 01f395e6d0ccf3a44a390cb9526750020621d865
Remote main after fetch: 01f395e6d0ccf3a44a390cb9526750020621d865
Worktree: clean
Line-ending-only diff check: clean
Release branch: codex/burgerforge-ai-vercel-ready-rebuild
Node.js: v24.18.0
npm: 10.2.4
GitHub CLI: 2.96.0, authenticated as princeinoba
Vercel CLI: 58.0.0, authenticated as princeinoba
Vercel team: princeinobas-projects
```

No newer unpublished owner work was present. The owner-controlled `.git`, remote, and history were preserved.

## Selected baseline and provenance

The checksum-verified clean-room source was extracted into a separate temporary staging directory, verified, and then installed at the real repository root. It contained no embedded `.git` directory. Neither original archive was extracted over the repository, and no archive is part of the release source.

- Eat Da Burger supplies evidence for the manual-name, queued, devoured, undo/delete product concepts.
- Vercel AI SDK supplies architectural evidence for a provider-independent, server-only, structured-output boundary.
- The SDK monorepo, its Git history, package graph, and unrelated examples were not copied.
- `NOTICE.md` records the historical ISC/MIT conflict and the SDK Apache-2.0 provenance.
- No clean-room software licence was invented; redistribution remains an owner/legal decision.

## Legacy runtime removed

The deployable source no longer includes Express, Handlebars, MySQL, Bootstrap, Font Awesome, remote Google Fonts, Heroku scripts, or the historical controller/model/ORM/view tree. Git history remains the recoverable record of those removed files.

## Preserved and added product value

Preserved: manual burger entry, queue/devoured states, deletion, undo, and the playful burger identity.

Added: exactly-three deterministic Builder, explicit save choice, eight curated concepts, async browser-local Board, filters/counts/export/import/clear, private Tasting Journal, responsive navigation/themes/command palette, safety and privacy boundaries, PWA/offline shell, two bounded Vercel Functions, deterministic build, tests, CI, and release documentation.

## Preflight corrections

Direct verification found and corrected three clean-room candidate issues before release:

1. Windows filesystem roots used URL pathnames and produced `C:\C:\...`; scripts now use `fileURLToPath`.
2. Repeated inline SVG definition IDs were invalid on multi-illustration pages; artwork IDs are now deterministic and unique, with a build regression assertion.
3. Journal save confirmation targeted a detached card after rerender; it now targets the newly rendered journal card and is visible to the user.

At preflight, no Vercel project named `burgerforge-ai` existed under `princeinobas-projects`; creating and linking exactly one project remains part of the release phase.
