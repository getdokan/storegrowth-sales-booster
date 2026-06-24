---
description: Prepare a tagged release — bump version everywhere, replace SPSG_VERSION, update the changelog, commit, and create the git tag (stops before pushing).
argument-hint: <version> (e.g. 2.2.0, no leading "v")
allowed-tools: Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(git tag:*), Bash(git log:*), Bash(git diff:*), Bash(grep:*), Bash(npm run version:*), Bash(npm run makepot:*), Edit, Read
---

Prepare release **$1** for this WordPress plugin (StoreGrowth — Sales Booster).

Releases are driven by pushing a `vX.Y.Z` git tag. `.github/workflows/deploy.yml`
triggers on **any** tag push and (1) builds the plugin, (2) deploys it to the
WordPress.org SVN repo (slug `storegrowth-sales-booster`), and (3) creates a
GitHub release with the zip. This command prepares everything locally and
**stops before pushing** — the user pushes the tag themselves to fire the live
public release.

## Preconditions — verify first, abort with a clear message if any fail

1. A version argument was given in `$1`. If empty, stop and ask for one.
2. `$1` is a valid semver `X.Y.Z` with **no** leading `v`. If it has a `v`, strip it.
3. The working tree is clean (`git status --porcelain` is empty). If not, stop and
   show what's dirty — do not bundle unrelated changes into a release commit.
4. The tag `v$1` does not already exist (`git tag -l v$1` is empty).
5. `$1` is greater than the current version (read from the `Version:` header in
   `storegrowth-sales-booster.php`). If it is lower or equal, warn and ask to confirm.

## Steps

1. Bump the version by hand in **all four** locations (Edit each, exact replacement
   — `bin/version-replace.sh` does **not** touch any of these):
   - `storegrowth-sales-booster.php` → the `* Version:` plugin header
   - `storegrowth-sales-booster.php` → the `define( 'STOREGROWTH_VERSION', '...' )` constant
   - `package.json` → the top-level `"version"` field (must be bumped **before** step 3)
   - `readme.txt` → the `Stable tag:` header

2. Update the changelog in `readme.txt`. Draft a new entry below `== Changelog ==`:

   ```
   = v$1 (<Month DD, YYYY>) =

   * <New/Enhancement/Fix>: ...
   ```

   Build the bullet list from `git log <last-tag>..HEAD` (last tag = `git describe
   --tags --abbrev=0`). Group as New / Enhancement / Fix, write user-facing prose
   (not raw commit subjects), and **show the draft to the user for confirmation
   before committing** — release notes are public on WordPress.org. Also check
   whether `Tested up to:` should be bumped for this release.

3. Replace the `SPSG_VERSION` placeholders in source: run `npm run version`. It
   reads `version` from `package.json` (bumped in step 1) and rewrites every
   `@since SPSG_VERSION` / `@deprecated SPSG_VERSION` docblock to `$1`. These are
   permanent — they get committed as part of the release.

4. Regenerate translations: run `npm run makepot` (updates
   `languages/storegrowth-sales-booster.pot`). Skip only if `wp` CLI is unavailable
   — if so, tell the user.

5. Confirm the bumps with
   `grep -n "Version:\|STOREGROWTH_VERSION" storegrowth-sales-booster.php`,
   `grep -n '"version"' package.json`, and `grep -n "Stable tag" readme.txt` — all
   must read `$1`. Run `git status` and review `git diff` so nothing unexpected
   (stray `SPSG_VERSION` left behind, unrelated files) is staged.

6. Commit: `git commit -am "chore(release): v$1"`.

7. Create an annotated tag: `git tag -a v$1 -m "Release v$1"`.

8. **Stop.** Do not push. Print the exact command for the user to run when ready,
   and remind them it triggers the **public WordPress.org deploy + GitHub release**:

   ```
   git push origin develop && git push origin v$1
   ```

   (Adjust the branch name if not on `develop`.)

## Notes

- Keep the four version strings in lockstep — a mismatch between the header, the
  `STOREGROWTH_VERSION` constant, `package.json`, and the `Stable tag` is the most
  common release bug here.
- Do **not** rewrite existing `@since X.Y.Z` docblocks that already have a real
  number — `npm run version` only touches the literal `SPSG_VERSION` placeholder.
- The CI workflow builds the zip itself (`composer install --no-dev -o && npm run
  build`); you do **not** need to run `npm run build` or `npm run archiver` locally
  to release. Those are only for producing a local artifact via `npm run release`.
