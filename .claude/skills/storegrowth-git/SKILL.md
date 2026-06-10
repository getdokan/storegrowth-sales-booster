---
name: storegrowth-git
description: StoreGrowth (Sales Booster) git, build, versioning, and release workflow — branching, commits/PRs, the SPSG_VERSION placeholder, makepot, and the WordPress.org deploy. Use when committing, opening PRs, bumping the version, or cutting a release.
---

# StoreGrowth Git, Versioning & Release

## Branching

- Default / integration branch is **`develop`** (PRs target it; the WordPress.org plugin name is `storegrowth-sales-booster`).
- Never commit directly to `develop` — branch first: `git switch -c <type>/<short-desc>` (e.g. `feature/bogo-start-date`, `fix/fly-cart-badge`, `chore/phpcs-ci`).
- Commit/push only when the user asks.

## Commits & PRs

- Prefer Conventional-Commit prefixes (`feat:`, `fix:`, `chore:`, `refactor:`) for new commits.
- PRs are squash-merged; the squash title carries the PR number, e.g. `Feature/bogo start end date (#535)`. Keep the title descriptive.
- One logical change per PR; update `readme.txt` / `CHANGELOG.md` for user-facing changes. There is no PR template in this repo.

## Version placeholder — `SPSG_VERSION`

New code documents the version it ships in with the literal placeholder, never a number:

```php
/**
 * @since SPSG_VERSION
 */
```

This applies to PHP and JS (`@since SPSG_VERSION`). At release, `bin/version-replace.sh` (run via `npm run version`) reads `version` from `package.json` and replaces every `SPSG_VERSION` across source files (`*.php`/`*.js`/`*.jsx`/`*.ts`/`*.tsx`/`*.scss`/`*.css`, excluding `node_modules`/`vendor`/`lib`/`build`/`dist`). It mirrors dokan-lite's `bin/version-replace.js`.

- **Do not** edit an existing `@since X.Y.Z` that already has a real number — only new code gets the placeholder.
- If you find merged PRs that hardcoded a new `@since`, convert those (and only those, newly-added) to `SPSG_VERSION`: `git diff <last-tag>..HEAD` for added `@since` lines.

## Manual version bumps (not handled by the script)

When cutting a release, bump these by hand to the new version — `version-replace.sh` does NOT touch them:

- `package.json` → `version`
- `storegrowth-sales-booster.php` → `Version:` header **and** `define( 'STOREGROWTH_VERSION', '…' )`
- `readme.txt` → `Stable tag:`
- `CHANGELOG.md` / `readme.txt` changelog entry

## Build & release commands

```bash
composer install            # dev: runs mozart (prefixes deps into lib/) + dumps autoload
npm install
npm run build               # build all JS (lerna + wp-scripts)
npm run makepot             # regenerate languages/storegrowth-sales-booster.pot
npm run version             # replace SPSG_VERSION -> package.json version
npm run archiver            # zip per .distignore (node archiver.js)
npm run release             # composer no-dev + build + version + makepot + archiver
```

`release` order matters: `version` runs after `build` so both source and built JS get the real number, before `makepot`/`archiver`.

## Mozart (third-party prefixing)

`composer install`/`update` in **dev mode** runs mozart, prefixing `league/container` + appsero packages into `StorePulse\StoreGrowth\ThirdParty\Packages\` under `lib/`. `lib/` is committed and ships in the release. Don't hand-edit it — change `composer.json` and regenerate. `composer.lock` should be committed; if you add dev deps (e.g. phpcs), run `composer update` and commit the lock.

## CI workflows (`.github/workflows/`)

- **`phpcs.yml`** — on every PR, runs PHPCS on the changed PHP files only (GitHub API diff → `vendor/bin/phpcs` → `cs2pr` inline annotations). Keep changed files clean: `composer phpcs` / `composer phpcbf` locally.
- **`deploy.yml`** — on pushing a **tag**, builds (`composer install --no-dev -o`, `npm run build`) and deploys to WordPress.org SVN via `10up/action-wordpress-plugin-deploy`, then creates a GitHub release zip. So a release = bump versions → merge to `develop` → tag (tags look like `v2.0.6`) → push tag.
- **`asset-update.yml`** — manual (`workflow_dispatch`) push of readme/assets to the WordPress.org trunk.

## Dev-only files excluded from the shipped zip

`bin/`, `.claude/`, build configs, etc. are excluded via `.distignore` (archiver) and `.svnignore` (SVN deploy). When adding dev tooling, add it to both ignore files so it doesn't ship to WordPress.org.
