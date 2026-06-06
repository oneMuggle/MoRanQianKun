# tsconfig.strict.json L1→L2→L3 Evolution

> Created: 2026-06-06 (Phase 2 Day 1 of 60-day optimization roadmap)
> Plan: docs/plans/2026-06-06_phase2-ts-strict-layered.md
> Spec: docs/superpowers/specs/2026-06-06-project-optimization-roadmap-v2-design.md

## Current State (L1, Day 1)

`tsconfig.strict.json` enables only 2 strict flags on 12 hand-picked utility files:
- `strictNullChecks: true`
- `noImplicitOverride: true`

The 12-file `include` is **intentionally** a manual list, not a `utils/**` glob:

1. **Lower blast radius**: starting with 12 files surfaces ~2-5 errors (manageable, fast feedback)
2. **Manual curation**: every file added to L1 strict is a deliberate signal — "this is production-quality code, ready for strict"
3. **Tracked progression**: each new file added = an explicit commit + a known-good audit

## Evolution Path

### L1 → L2 (target: Day 22)
Switch from 12 manual paths to `utils/**/*.ts` glob. Pre-requisites:
- L1 must reach 0 errors on the 12 files (currently 2 known errors in `models/npcNSFWEnhancement/discovery/personalityTrigger.ts:267` and `prompts/runtime/variableModel.ts:178` — to be fixed in Day 2-3)
- vitest coverage on the 12 files must be ≥ 60% (Phase 5 prerequisite)

### L2 → L3 (target: Day 30+)
Add `models/**` and `services/**` paths. L3 means full strict mode (`strict: true`) on the entire core layer.

## Adding a New File to L1

1. Verify the file has no existing strict-mode errors:
   ```bash
   npx tsc --noEmit -p tsconfig.strict.json 2>&1 | grep "your-file.ts"
   ```
2. Add the path to `tsconfig.strict.json`'s `include` array
3. Run `npx tsc --noEmit -p tsconfig.strict.json` — should still produce 0 new errors
4. Commit with message: `feat(strict): add <filename> to L1 strict include`

## Known Issues

As of Day 1:
- 2 transitive errors in `models/npcNSFWEnhancement/discovery/personalityTrigger.ts:267` and `prompts/runtime/variableModel.ts:178` (TS2322 / TS2345)
- These are concrete `undefined` leaks, not transitive noise
- Target fix: Day 2-3 (well before L2 glob expansion)
