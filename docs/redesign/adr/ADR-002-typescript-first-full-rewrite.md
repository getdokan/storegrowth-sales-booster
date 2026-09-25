# ADR-002: TypeScript-first full rewrite of the admin UI

- Status: Accepted
- Date: 2026-09-25
- Related: ADR-001, ADR-003, `../report.md`

## Context

The admin UI is untyped JS on antd:
- About 64 pro fields are injected through `@wordpress/hooks` `addFilter` slots.
- Lite ships disabled "pro-preview" teasers in the same slots.
- Settings load and save over 10 separate admin-ajax pairs, using 3 different payload encodings.

The redesign replaces every screen (see `report.md`). Porting the old components one at a time would mean keeping antd, the filter slots and the ajax transport alive next to the new stack.

## Decision

1. **Full rewrite, not an incremental port.**
   - New screens are built from scratch on plugin-ui plus StoreGrowth components (report §6).
   - Old antd components and their JS filter hooks are deleted once each module moves.
   - Old bundles stay enqueued only for modules not yet migrated. This happens per module; there is no big-bang switch.
2. **TypeScript first.**
   - All new admin code is `.ts`/`.tsx`. No new `.js`.
   - `tsconfig.json` copies dokan-lite: `strict: true`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, `skipLibCheck`.
   - `include`: `src/**/*`, `modules/*/src/**/*`, `integrations/src/**/*`, `types/**/*`.
   - `paths` mirror the webpack aliases: `@storegrowth/*`, `@src/*`.
3. **Type checking in CI.** wp-scripts compiles TS through Babel, which strips types without checking them. Add `npm run type-check` (`tsc --noEmit`) and run it in CI and before release.
4. **Global and external typings** live in `types/`, following dokan-lite's `types/{globals,externals,styles}.d.ts`:
   - `window.spsgAdmin`, `window.storegrowth.*`
   - `@storegrowth/*` modules
   - CSS imports
5. **The server defines the settings schema; TypeScript types its shape.** PHP owns field definitions, defaults and sanitization, and serves them over REST (report §5). TS declares the schema and value interfaces and does not duplicate field lists.
6. **Pro extends the schema in PHP, not through JS hooks.**
   - Pro adds its fields and `pro` flags through the PHP schema filter.
   - Lite renders locked states from that flag.
   - Pro ships TS only for custom fields or preview widgets, registered through the shell API in `@storegrowth/components`.
7. **New symbols get `@since SPSG_VERSION`.** This applies to TS too, and `bin/version-replace.sh` already sweeps `.ts`/`.tsx`.

## Consequences

- Type errors are caught at build/CI time.
- A typed API client (`src/api/`) removes today's mix of raw `fetch`, `wpApiSettings.nonce` and jQuery ajax.
- Removing antd removes a large dependency and its CSS from every page.
- The Dokan vendor BOGO screen currently imports lite's `CreateBogo`. It has to move to the new editor, or keep the old bundle until migrated (migration spec, phase 4).
- The storegrowth-frontend-dev and storegrowth-module-dev skills and `CLAUDE.md` have to be rewritten.

## Alternatives considered

| Option | Why rejected |
|---|---|
| Incremental port, keep antd underneath | Two design systems on one page and a double bundle cost. The new designs don't map to antd anyway. |
| JS with JSDoc types | Weaker guarantees; dokan-lite has already standardised on TS |
| Keep JS filter slots for pro | Schema-driven fields make them redundant, and they are the source of today's teaser/real-field duplication |
